import { Router } from "express";
import { openDatabase } from "../db/client.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

export const commentRouter = Router();

function mapComment(row) {
  return {
    id: row.id,
    postId: row.post_id,
    authorId: row.author_id,
    authorName: row.author_name || "unknown",
    parentId: row.parent_id,
    content: row.content,
    likeCount: row.like_count,
    dislikeCount: row.dislike_count,
    isDeleted: Boolean(row.is_deleted),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getComment(db, id) {
  const row = await db.get(
    `
      SELECT comments.*, users.name AS author_name
      FROM comments
      LEFT JOIN users ON users.id = comments.author_id
      WHERE comments.id = ?
    `,
    id,
  );
  return row ? mapComment(row) : null;
}

commentRouter.get("/post/:postId", async (req, res, next) => {
  const db = await openDatabase();

  try {
    const rows = await db.all(
      `
        SELECT comments.*, users.name AS author_name
        FROM comments
        LEFT JOIN users ON users.id = comments.author_id
        WHERE comments.post_id = ? AND comments.is_deleted = 0
        ORDER BY comments.created_at ASC
      `,
      req.params.postId,
    );
    res.json({ comments: rows.map(mapComment) });
  } catch (error) {
    next(error);
  } finally {
    await db.close();
  }
});

commentRouter.post("/post/:postId", authMiddleware, async (req, res, next) => {
  const { content } = req.body;

  if (!content) return res.status(400).json({ message: "댓글 내용은 필수입니다." });

  const db = await openDatabase();

  try {
    const post = await db.get("SELECT id FROM posts WHERE id = ? AND is_deleted = 0", req.params.postId);
    if (!post) return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });

    const id = `comment-${Date.now()}`;
    await db.run(
      `
        INSERT INTO comments (
          id,
          post_id,
          author_id,
          parent_id,
          content,
          like_count,
          dislike_count,
          is_deleted,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, NULL, ?, 0, 0, 0, datetime('now'), datetime('now'))
      `,
      id,
      post.id,
      req.user.id,
      content,
    );
    res.status(201).json({ comment: await getComment(db, id) });
  } catch (error) {
    next(error);
  } finally {
    await db.close();
  }
});

commentRouter.post("/:commentId/replies", authMiddleware, async (req, res, next) => {
  const { content } = req.body;

  if (!content) return res.status(400).json({ message: "답글 내용은 필수입니다." });

  const db = await openDatabase();

  try {
    const parent = await db.get("SELECT * FROM comments WHERE id = ? AND is_deleted = 0", req.params.commentId);
    if (!parent) return res.status(404).json({ message: "댓글을 찾을 수 없습니다." });

    const id = `comment-${Date.now()}`;
    await db.run(
      `
        INSERT INTO comments (
          id,
          post_id,
          author_id,
          parent_id,
          content,
          like_count,
          dislike_count,
          is_deleted,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, 0, 0, 0, datetime('now'), datetime('now'))
      `,
      id,
      parent.post_id,
      req.user.id,
      parent.id,
      content,
    );
    res.status(201).json({ comment: await getComment(db, id) });
  } catch (error) {
    next(error);
  } finally {
    await db.close();
  }
});

commentRouter.patch("/:id", authMiddleware, async (req, res, next) => {
  const db = await openDatabase();

  try {
    const comment = await db.get("SELECT * FROM comments WHERE id = ? AND is_deleted = 0", req.params.id);
    if (!comment) return res.status(404).json({ message: "댓글을 찾을 수 없습니다." });
    if (comment.author_id !== req.user.id) return res.status(403).json({ message: "본인 댓글만 수정할 수 있습니다." });

    await db.run(
      "UPDATE comments SET content = ?, updated_at = datetime('now') WHERE id = ?",
      req.body.content ?? comment.content,
      req.params.id,
    );
    res.json({ comment: await getComment(db, req.params.id) });
  } catch (error) {
    next(error);
  } finally {
    await db.close();
  }
});

commentRouter.delete("/:id", authMiddleware, async (req, res, next) => {
  const db = await openDatabase();

  try {
    const comment = await db.get("SELECT * FROM comments WHERE id = ? AND is_deleted = 0", req.params.id);
    if (!comment) return res.status(404).json({ message: "댓글을 찾을 수 없습니다." });
    if (comment.author_id !== req.user.id) return res.status(403).json({ message: "본인 댓글만 삭제할 수 있습니다." });

    const descendants = await db.all(
      `
        WITH RECURSIVE comment_tree(id) AS (
          SELECT id FROM comments WHERE id = ?
          UNION ALL
          SELECT comments.id
          FROM comments
          JOIN comment_tree ON comments.parent_id = comment_tree.id
        )
        SELECT id FROM comment_tree
      `,
      req.params.id,
    );
    const ids = descendants.map((item) => item.id);
    const placeholders = ids.map(() => "?").join(",");

    await db.run(
      `UPDATE comments SET is_deleted = 1, updated_at = datetime('now') WHERE id IN (${placeholders})`,
      ...ids,
    );
    res.json({ message: "댓글이 삭제되었습니다.", deletedCount: ids.length });
  } catch (error) {
    next(error);
  } finally {
    await db.close();
  }
});

commentRouter.post("/:id/reactions/:type", authMiddleware, async (req, res, next) => {
  const { type } = req.params;

  if (!["like", "dislike"].includes(type)) return res.status(400).json({ message: "올바르지 않은 반응입니다." });

  const db = await openDatabase();

  try {
    const comment = await db.get("SELECT * FROM comments WHERE id = ? AND is_deleted = 0", req.params.id);
    if (!comment) return res.status(404).json({ message: "댓글을 찾을 수 없습니다." });

    const existing = await db.get("SELECT * FROM comment_reactions WHERE comment_id = ? AND user_id = ?", comment.id, req.user.id);

    if (existing?.type === type) {
      await db.run("DELETE FROM comment_reactions WHERE id = ?", existing.id);
    } else if (existing) {
      await db.run("UPDATE comment_reactions SET type = ?, updated_at = datetime('now') WHERE id = ?", type, existing.id);
    } else {
      await db.run(
        `
          INSERT INTO comment_reactions (
            id,
            comment_id,
            user_id,
            type,
            created_at,
            updated_at
          ) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
        `,
        `reaction-${Date.now()}`,
        comment.id,
        req.user.id,
        type,
      );
    }

    const counts = await db.get(
      `
        SELECT
          COUNT(CASE WHEN type = 'like' THEN 1 END) AS likeCount,
          COUNT(CASE WHEN type = 'dislike' THEN 1 END) AS dislikeCount
        FROM comment_reactions
        WHERE comment_id = ?
      `,
      comment.id,
    );

    await db.run(
      "UPDATE comments SET like_count = ?, dislike_count = ?, updated_at = datetime('now') WHERE id = ?",
      counts.likeCount,
      counts.dislikeCount,
      comment.id,
    );

    res.json({ comment: await getComment(db, comment.id) });
  } catch (error) {
    next(error);
  } finally {
    await db.close();
  }
});

import { Router } from "express";
import { openDatabase } from "../db/client.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

export const postRouter = Router();

function mapPost(row) {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    imageUrl: row.image_url || "",
    authorId: row.author_id,
    authorName: row.author_name || "unknown",
    viewCount: row.view_count,
    likeCount: row.like_count ?? 0,
    dislikeCount: row.dislike_count ?? 0,
    commentCount: row.comment_count ?? 0,
    isDeleted: Boolean(row.is_deleted),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

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

postRouter.get("/", async (req, res, next) => {
  const db = await openDatabase();

  try {
    const rows = await db.all(`
      SELECT
        posts.*,
        users.name AS author_name,
        COUNT(DISTINCT comments.id) AS comment_count,
        COUNT(DISTINCT likes.id) AS like_count,
        COUNT(DISTINCT dislikes.id) AS dislike_count
      FROM posts
      LEFT JOIN users ON users.id = posts.author_id
      LEFT JOIN comments ON comments.post_id = posts.id AND comments.is_deleted = 0
      LEFT JOIN post_reactions AS likes ON likes.post_id = posts.id AND likes.type = 'like'
      LEFT JOIN post_reactions AS dislikes ON dislikes.post_id = posts.id AND dislikes.type = 'dislike'
      WHERE posts.is_deleted = 0
      GROUP BY posts.id
      ORDER BY posts.created_at DESC
    `);
    res.json({ posts: rows.map(mapPost) });
  } catch (error) {
    next(error);
  } finally {
    await db.close();
  }
});

postRouter.get("/:postId/comments", async (req, res, next) => {
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

postRouter.post("/:postId/comments", authMiddleware, async (req, res, next) => {
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

    const row = await db.get(
      `
        SELECT comments.*, users.name AS author_name
        FROM comments
        LEFT JOIN users ON users.id = comments.author_id
        WHERE comments.id = ?
      `,
      id,
    );
    res.status(201).json({ comment: mapComment(row) });
  } catch (error) {
    next(error);
  } finally {
    await db.close();
  }
});

postRouter.get("/:id", async (req, res, next) => {
  const db = await openDatabase();

  try {
    const existing = await db.get("SELECT id FROM posts WHERE id = ? AND is_deleted = 0", req.params.id);
    if (!existing) return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });

    await db.run("UPDATE posts SET view_count = view_count + 1 WHERE id = ?", req.params.id);
    const row = await db.get(
      `
        SELECT
          posts.*,
          users.name AS author_name,
          COUNT(DISTINCT comments.id) AS comment_count,
          COUNT(DISTINCT likes.id) AS like_count,
          COUNT(DISTINCT dislikes.id) AS dislike_count
        FROM posts
        LEFT JOIN users ON users.id = posts.author_id
        LEFT JOIN comments ON comments.post_id = posts.id AND comments.is_deleted = 0
        LEFT JOIN post_reactions AS likes ON likes.post_id = posts.id AND likes.type = 'like'
        LEFT JOIN post_reactions AS dislikes ON dislikes.post_id = posts.id AND dislikes.type = 'dislike'
        WHERE posts.id = ?
        GROUP BY posts.id
      `,
      req.params.id,
    );
    return res.json({ post: mapPost(row) });
  } catch (error) {
    return next(error);
  } finally {
    await db.close();
  }
});

postRouter.post("/", authMiddleware, async (req, res, next) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: "제목과 내용은 필수입니다." });
  }

  const db = await openDatabase();

  try {
    const id = `post-${Date.now()}`;
    await db.run(
      `
        INSERT INTO posts (
          id,
          title,
          content,
          image_url,
          author_id,
          view_count,
          is_deleted,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, 0, 0, datetime('now'), datetime('now'))
      `,
      id,
      title,
      content,
      req.body.imageUrl || null,
      req.user.id,
    );

    const row = await db.get(
      `
        SELECT posts.*, users.name AS author_name, 0 AS comment_count, 0 AS like_count, 0 AS dislike_count
        FROM posts
        LEFT JOIN users ON users.id = posts.author_id
        WHERE posts.id = ?
      `,
      id,
    );
    return res.status(201).json({ post: mapPost(row) });
  } catch (error) {
    return next(error);
  } finally {
    await db.close();
  }
});

postRouter.patch("/:id", authMiddleware, async (req, res, next) => {
  const db = await openDatabase();

  try {
    const post = await db.get("SELECT * FROM posts WHERE id = ? AND is_deleted = 0", req.params.id);
    if (!post) return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    if (post.author_id !== req.user.id) return res.status(403).json({ message: "본인 게시글만 수정할 수 있습니다." });

    await db.run(
      "UPDATE posts SET title = ?, content = ?, image_url = ?, updated_at = datetime('now') WHERE id = ?",
      req.body.title ?? post.title,
      req.body.content ?? post.content,
      req.body.imageUrl ?? post.image_url,
      req.params.id,
    );

    const row = await db.get(
      `
        SELECT
          posts.*,
          users.name AS author_name,
          COUNT(DISTINCT comments.id) AS comment_count,
          COUNT(DISTINCT likes.id) AS like_count,
          COUNT(DISTINCT dislikes.id) AS dislike_count
        FROM posts
        LEFT JOIN users ON users.id = posts.author_id
        LEFT JOIN comments ON comments.post_id = posts.id AND comments.is_deleted = 0
        LEFT JOIN post_reactions AS likes ON likes.post_id = posts.id AND likes.type = 'like'
        LEFT JOIN post_reactions AS dislikes ON dislikes.post_id = posts.id AND dislikes.type = 'dislike'
        WHERE posts.id = ?
        GROUP BY posts.id
      `,
      req.params.id,
    );
    return res.json({ post: mapPost(row) });
  } catch (error) {
    return next(error);
  } finally {
    await db.close();
  }
});

postRouter.delete("/:id", authMiddleware, async (req, res, next) => {
  const db = await openDatabase();

  try {
    const post = await db.get("SELECT * FROM posts WHERE id = ? AND is_deleted = 0", req.params.id);
    if (!post) return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    if (post.author_id !== req.user.id) return res.status(403).json({ message: "본인 게시글만 삭제할 수 있습니다." });

    await db.run("UPDATE posts SET is_deleted = 1, updated_at = datetime('now') WHERE id = ?", req.params.id);
    return res.json({ message: "게시글이 삭제되었습니다." });
  } catch (error) {
    return next(error);
  } finally {
    await db.close();
  }
});

postRouter.post("/:id/reactions/:type", authMiddleware, async (req, res, next) => {
  const { type } = req.params;

  if (!["like", "dislike"].includes(type)) {
    return res.status(400).json({ message: "올바르지 않은 반응입니다." });
  }

  const db = await openDatabase();

  try {
    const post = await db.get("SELECT id FROM posts WHERE id = ? AND is_deleted = 0", req.params.id);
    if (!post) return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });

    const existing = await db.get("SELECT * FROM post_reactions WHERE post_id = ? AND user_id = ?", post.id, req.user.id);

    if (existing?.type === type) {
      await db.run("DELETE FROM post_reactions WHERE id = ?", existing.id);
    } else if (existing) {
      await db.run("UPDATE post_reactions SET type = ?, updated_at = datetime('now') WHERE id = ?", type, existing.id);
    } else {
      await db.run(
        `
          INSERT INTO post_reactions (
            id,
            post_id,
            user_id,
            type,
            created_at,
            updated_at
          ) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
        `,
        `post-reaction-${Date.now()}`,
        post.id,
        req.user.id,
        type,
      );
    }

    const counts = await db.get(
      `
        SELECT
          COUNT(CASE WHEN type = 'like' THEN 1 END) AS likeCount,
          COUNT(CASE WHEN type = 'dislike' THEN 1 END) AS dislikeCount
        FROM post_reactions
        WHERE post_id = ?
      `,
      post.id,
    );
    return res.json({ counts });
  } catch (error) {
    return next(error);
  } finally {
    await db.close();
  }
});

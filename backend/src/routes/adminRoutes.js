import { Router } from "express";
import { openDatabase } from "../db/client.js";
import { adminMiddleware } from "../middlewares/adminMiddleware.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

export const adminRouter = Router();

adminRouter.use(authMiddleware, adminMiddleware);

function mapPost(row) {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    authorId: row.author_id,
    authorName: row.author_name || "unknown",
    viewCount: row.view_count,
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
    postTitle: row.post_title || "",
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

adminRouter.get("/summary", async (req, res, next) => {
  const db = await openDatabase();

  try {
    const [users, posts, comments, activePosts] = await Promise.all([
      db.get("SELECT COUNT(*) AS count FROM users WHERE is_active = 1"),
      db.get("SELECT COUNT(*) AS count FROM posts"),
      db.get("SELECT COUNT(*) AS count FROM comments"),
      db.get("SELECT COUNT(*) AS count FROM posts WHERE is_deleted = 0"),
    ]);

    res.json({
      summary: {
        users: users.count,
        posts: posts.count,
        activePosts: activePosts.count,
        comments: comments.count,
      },
    });
  } catch (error) {
    next(error);
  } finally {
    await db.close();
  }
});

adminRouter.get("/posts", async (req, res, next) => {
  const db = await openDatabase();

  try {
    const rows = await db.all(`
      SELECT
        posts.*,
        users.name AS author_name,
        COUNT(comments.id) AS comment_count
      FROM posts
      LEFT JOIN users ON users.id = posts.author_id
      LEFT JOIN comments ON comments.post_id = posts.id
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

adminRouter.get("/posts/:id", async (req, res, next) => {
  const db = await openDatabase();

  try {
    const row = await db.get(
      `
        SELECT posts.*, users.name AS author_name, COUNT(comments.id) AS comment_count
        FROM posts
        LEFT JOIN users ON users.id = posts.author_id
        LEFT JOIN comments ON comments.post_id = posts.id
        WHERE posts.id = ?
        GROUP BY posts.id
      `,
      req.params.id,
    );

    if (!row) return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    return res.json({ post: mapPost(row) });
  } catch (error) {
    return next(error);
  } finally {
    await db.close();
  }
});

adminRouter.patch("/posts/:id", async (req, res, next) => {
  const db = await openDatabase();

  try {
    const existing = await db.get("SELECT * FROM posts WHERE id = ?", req.params.id);
    if (!existing) return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });

    await db.run(
      "UPDATE posts SET title = ?, content = ?, updated_at = datetime('now') WHERE id = ?",
      req.body.title ?? existing.title,
      req.body.content ?? existing.content,
      req.params.id,
    );

    const post = await db.get("SELECT posts.*, users.name AS author_name, 0 AS comment_count FROM posts LEFT JOIN users ON users.id = posts.author_id WHERE posts.id = ?", req.params.id);
    return res.json({ post: mapPost(post) });
  } catch (error) {
    return next(error);
  } finally {
    await db.close();
  }
});

adminRouter.delete("/posts/:id", async (req, res, next) => {
  const db = await openDatabase();

  try {
    const result = await db.run("UPDATE posts SET is_deleted = 1, updated_at = datetime('now') WHERE id = ?", req.params.id);
    if (!result.changes) return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    return res.json({ message: "관리자 권한으로 게시글을 삭제했습니다." });
  } catch (error) {
    return next(error);
  } finally {
    await db.close();
  }
});

adminRouter.get("/comments", async (req, res, next) => {
  const db = await openDatabase();

  try {
    const rows = await db.all(`
      SELECT
        comments.*,
        users.name AS author_name,
        posts.title AS post_title
      FROM comments
      LEFT JOIN users ON users.id = comments.author_id
      LEFT JOIN posts ON posts.id = comments.post_id
      ORDER BY comments.created_at DESC
    `);
    res.json({ comments: rows.map(mapComment) });
  } catch (error) {
    next(error);
  } finally {
    await db.close();
  }
});

adminRouter.get("/posts/:postId/comments", async (req, res, next) => {
  const db = await openDatabase();

  try {
    const rows = await db.all(
      `
        SELECT comments.*, users.name AS author_name, posts.title AS post_title
        FROM comments
        LEFT JOIN users ON users.id = comments.author_id
        LEFT JOIN posts ON posts.id = comments.post_id
        WHERE comments.post_id = ?
        ORDER BY comments.created_at DESC
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

adminRouter.delete("/comments/:id", async (req, res, next) => {
  const db = await openDatabase();

  try {
    const result = await db.run("UPDATE comments SET is_deleted = 1, updated_at = datetime('now') WHERE id = ?", req.params.id);
    if (!result.changes) return res.status(404).json({ message: "댓글을 찾을 수 없습니다." });
    return res.json({ message: "관리자 권한으로 댓글을 삭제했습니다." });
  } catch (error) {
    return next(error);
  } finally {
    await db.close();
  }
});

adminRouter.get("/users", async (req, res, next) => {
  const db = await openDatabase();

  try {
    const users = await db.all(`
      SELECT id, name, email, role, bio, is_active, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `);
    res.json({
      users: users.map((user) => ({
        ...user,
        isActive: Boolean(user.is_active),
        is_active: undefined,
      })),
    });
  } catch (error) {
    next(error);
  } finally {
    await db.close();
  }
});

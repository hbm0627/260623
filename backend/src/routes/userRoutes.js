import { Router } from "express";
import { openDatabase } from "../db/client.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

export const userRouter = Router();

function publicUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

userRouter.get("/me", authMiddleware, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

userRouter.patch("/me", authMiddleware, async (req, res, next) => {
  const { name, bio } = req.body;
  const db = await openDatabase();

  try {
    await db.run(
      "UPDATE users SET name = ?, bio = ?, updated_at = datetime('now') WHERE id = ?",
      name || req.user.name,
      bio ?? req.user.bio,
      req.user.id,
    );

    const user = await db.get("SELECT id, name, email, role, bio, is_active FROM users WHERE id = ?", req.user.id);
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        isActive: Boolean(user.is_active),
      },
    });
  } catch (error) {
    next(error);
  } finally {
    await db.close();
  }
});

userRouter.get("/me/posts", authMiddleware, async (req, res, next) => {
  const db = await openDatabase();

  try {
    const posts = await db.all(
      `
        SELECT
          id,
          title,
          content,
          image_url AS imageUrl,
          author_id AS authorId,
          view_count AS viewCount,
          is_deleted AS isDeleted,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM posts
        WHERE author_id = ? AND is_deleted = 0
        ORDER BY created_at DESC
      `,
      req.user.id,
    );
    res.json({ posts: posts.map((post) => ({ ...post, isDeleted: Boolean(post.isDeleted) })) });
  } catch (error) {
    next(error);
  } finally {
    await db.close();
  }
});

userRouter.delete("/me", authMiddleware, async (req, res, next) => {
  const db = await openDatabase();

  try {
    await db.exec("BEGIN TRANSACTION");

    const userPosts = await db.all("SELECT id FROM posts WHERE author_id = ?", req.user.id);
    const postIds = userPosts.map((post) => post.id);

    if (postIds.length) {
      const placeholders = postIds.map(() => "?").join(",");
      await db.run(
        `DELETE FROM comment_reactions WHERE comment_id IN (SELECT id FROM comments WHERE post_id IN (${placeholders}))`,
        ...postIds,
      );
      await db.run(`DELETE FROM comments WHERE post_id IN (${placeholders})`, ...postIds);
      await db.run(`DELETE FROM post_reactions WHERE post_id IN (${placeholders})`, ...postIds);
      await db.run(`DELETE FROM posts WHERE id IN (${placeholders})`, ...postIds);
    }

    await db.run(
      "DELETE FROM comment_reactions WHERE comment_id IN (SELECT id FROM comments WHERE author_id = ?)",
      req.user.id,
    );
    await db.run("DELETE FROM comments WHERE author_id = ?", req.user.id);
    await db.run("DELETE FROM comment_reactions WHERE user_id = ?", req.user.id);
    await db.run("DELETE FROM post_reactions WHERE user_id = ?", req.user.id);
    await db.run("DELETE FROM users WHERE id = ?", req.user.id);

    await db.exec("COMMIT");
    res.json({ message: "회원탈퇴가 완료되었습니다." });
  } catch (error) {
    await db.exec("ROLLBACK").catch(() => {});
    next(error);
  } finally {
    await db.close();
  }
});

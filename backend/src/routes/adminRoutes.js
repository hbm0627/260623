import { Router } from "express";
import { supabase, throwIfSupabaseError } from "../db/client.js";
import { countRows, enrichPost, getCommentCount, getPostById, mapComment, mapPost, now, publicUser } from "../db/repository.js";
import { adminMiddleware } from "../middlewares/adminMiddleware.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

export const adminRouter = Router();

adminRouter.use(authMiddleware, adminMiddleware);

adminRouter.get("/summary", async (req, res, next) => {
  try {
    const [users, posts, comments, activePosts] = await Promise.all([
      countRows("users", (query) => query.eq("is_active", true)),
      countRows("posts"),
      countRows("comments"),
      countRows("posts", (query) => query.eq("is_deleted", false)),
    ]);

    return res.json({ summary: { users, posts, activePosts, comments } });
  } catch (error) {
    return next(error);
  }
});

adminRouter.get("/posts", async (req, res, next) => {
  try {
    const { data, error } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
    throwIfSupabaseError(error);

    const posts = await Promise.all((data || []).map(enrichPost));
    return res.json({ posts });
  } catch (error) {
    return next(error);
  }
});

adminRouter.get("/posts/:id", async (req, res, next) => {
  try {
    const post = await getPostById(req.params.id, true);
    if (!post) return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    return res.json({ post: await enrichPost(post) });
  } catch (error) {
    return next(error);
  }
});

adminRouter.patch("/posts/:id", async (req, res, next) => {
  try {
    const existing = await getPostById(req.params.id, true);
    if (!existing) return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });

    const { data, error } = await supabase
      .from("posts")
      .update({
        title: req.body.title ?? existing.title,
        content: req.body.content ?? existing.content,
        updated_at: now(),
      })
      .eq("id", existing.id)
      .select("*")
      .single();
    throwIfSupabaseError(error);

    return res.json({ post: await enrichPost(data) });
  } catch (error) {
    return next(error);
  }
});

adminRouter.delete("/posts/:id", async (req, res, next) => {
  try {
    const existing = await getPostById(req.params.id, true);
    if (!existing) return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });

    const { error } = await supabase.from("posts").update({ is_deleted: true, updated_at: now() }).eq("id", existing.id);
    throwIfSupabaseError(error);
    return res.json({ message: "관리자 권한으로 게시글을 삭제했습니다." });
  } catch (error) {
    return next(error);
  }
});

adminRouter.get("/comments", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("comments")
      .select("*, users(name), posts(title)")
      .order("created_at", { ascending: false });
    throwIfSupabaseError(error);

    return res.json({
      comments: (data || []).map((row) => mapComment(row, { authorName: row.users?.name, postTitle: row.posts?.title })),
    });
  } catch (error) {
    return next(error);
  }
});

adminRouter.get("/posts/:postId/comments", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("comments")
      .select("*, users(name), posts(title)")
      .eq("post_id", req.params.postId)
      .order("created_at", { ascending: false });
    throwIfSupabaseError(error);

    return res.json({
      comments: (data || []).map((row) => mapComment(row, { authorName: row.users?.name, postTitle: row.posts?.title })),
    });
  } catch (error) {
    return next(error);
  }
});

adminRouter.delete("/comments/:id", async (req, res, next) => {
  try {
    const { data, error: lookupError } = await supabase.from("comments").select("id").eq("id", req.params.id).maybeSingle();
    throwIfSupabaseError(lookupError);
    if (!data) return res.status(404).json({ message: "댓글을 찾을 수 없습니다." });

    const { error } = await supabase.from("comments").update({ is_deleted: true, updated_at: now() }).eq("id", req.params.id);
    throwIfSupabaseError(error);
    return res.json({ message: "관리자 권한으로 댓글을 삭제했습니다." });
  } catch (error) {
    return next(error);
  }
});

adminRouter.get("/users", async (req, res, next) => {
  try {
    const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false });
    throwIfSupabaseError(error);
    return res.json({ users: (data || []).map(publicUser) });
  } catch (error) {
    return next(error);
  }
});

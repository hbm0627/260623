import { Router } from "express";
import { supabase, throwIfSupabaseError } from "../db/client.js";
import { enrichPost, getPostById, getReactionCounts, mapComment, now } from "../db/repository.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

export const postRouter = Router();

async function listComments(postId) {
  const { data, error } = await supabase
    .from("comments")
    .select("*, users(name)")
    .eq("post_id", postId)
    .eq("is_deleted", false)
    .order("created_at", { ascending: true });
  throwIfSupabaseError(error);
  return (data || []).map((row) => mapComment(row, { authorName: row.users?.name }));
}

postRouter.get("/", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });
    throwIfSupabaseError(error);

    const posts = await Promise.all((data || []).map(enrichPost));
    return res.json({ posts });
  } catch (error) {
    return next(error);
  }
});

postRouter.get("/:postId/comments", async (req, res, next) => {
  try {
    return res.json({ comments: await listComments(req.params.postId) });
  } catch (error) {
    return next(error);
  }
});

postRouter.post("/:postId/comments", authMiddleware, async (req, res, next) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ message: "댓글 내용은 필수입니다." });

  try {
    const post = await getPostById(req.params.postId);
    if (!post) return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });

    const { data, error } = await supabase
      .from("comments")
      .insert({
        id: `comment-${Date.now()}`,
        post_id: post.id,
        author_id: req.user.id,
        parent_id: null,
        content,
        like_count: 0,
        dislike_count: 0,
        is_deleted: false,
      })
      .select("*, users(name)")
      .single();
    throwIfSupabaseError(error);

    return res.status(201).json({ comment: mapComment(data, { authorName: data.users?.name }) });
  } catch (error) {
    return next(error);
  }
});

postRouter.get("/:id", async (req, res, next) => {
  try {
    const post = await getPostById(req.params.id);
    if (!post) return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });

    const { error } = await supabase
      .from("posts")
      .update({ view_count: (post.view_count || 0) + 1, updated_at: now() })
      .eq("id", post.id);
    throwIfSupabaseError(error);

    return res.json({ post: await enrichPost({ ...post, view_count: (post.view_count || 0) + 1 }) });
  } catch (error) {
    return next(error);
  }
});

postRouter.post("/", authMiddleware, async (req, res, next) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: "제목과 내용은 필수입니다." });
  }

  try {
    const { data, error } = await supabase
      .from("posts")
      .insert({
        id: `post-${Date.now()}`,
        title,
        content,
        image_url: req.body.imageUrl || null,
        author_id: req.user.id,
        view_count: 0,
        is_deleted: false,
      })
      .select("*")
      .single();
    throwIfSupabaseError(error);

    return res.status(201).json({ post: await enrichPost(data) });
  } catch (error) {
    return next(error);
  }
});

postRouter.patch("/:id", authMiddleware, async (req, res, next) => {
  try {
    const post = await getPostById(req.params.id);
    if (!post) return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    if (post.author_id !== req.user.id) return res.status(403).json({ message: "본인 게시글만 수정할 수 있습니다." });

    const { data, error } = await supabase
      .from("posts")
      .update({
        title: req.body.title ?? post.title,
        content: req.body.content ?? post.content,
        image_url: req.body.imageUrl ?? post.image_url,
        updated_at: now(),
      })
      .eq("id", post.id)
      .select("*")
      .single();
    throwIfSupabaseError(error);

    return res.json({ post: await enrichPost(data) });
  } catch (error) {
    return next(error);
  }
});

postRouter.delete("/:id", authMiddleware, async (req, res, next) => {
  try {
    const post = await getPostById(req.params.id);
    if (!post) return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    if (post.author_id !== req.user.id) return res.status(403).json({ message: "본인 게시글만 삭제할 수 있습니다." });

    const { error } = await supabase.from("posts").update({ is_deleted: true, updated_at: now() }).eq("id", post.id);
    throwIfSupabaseError(error);
    return res.json({ message: "게시글이 삭제되었습니다." });
  } catch (error) {
    return next(error);
  }
});

postRouter.post("/:id/reactions/:type", authMiddleware, async (req, res, next) => {
  const { type } = req.params;
  if (!["like", "dislike"].includes(type)) return res.status(400).json({ message: "올바르지 않은 반응입니다." });

  try {
    const post = await getPostById(req.params.id);
    if (!post) return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });

    const { data: existing, error: existingError } = await supabase
      .from("post_reactions")
      .select("*")
      .eq("post_id", post.id)
      .eq("user_id", req.user.id)
      .maybeSingle();
    throwIfSupabaseError(existingError);

    if (existing?.type === type) {
      const { error } = await supabase.from("post_reactions").delete().eq("id", existing.id);
      throwIfSupabaseError(error);
    } else if (existing) {
      const { error } = await supabase.from("post_reactions").update({ type, updated_at: now() }).eq("id", existing.id);
      throwIfSupabaseError(error);
    } else {
      const { error } = await supabase.from("post_reactions").insert({
        id: `post-reaction-${Date.now()}`,
        post_id: post.id,
        user_id: req.user.id,
        type,
      });
      throwIfSupabaseError(error);
    }

    return res.json({ counts: await getReactionCounts("post_reactions", "post_id", post.id) });
  } catch (error) {
    return next(error);
  }
});

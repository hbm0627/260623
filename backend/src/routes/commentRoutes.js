import { Router } from "express";
import { supabase, throwIfSupabaseError } from "../db/client.js";
import { enrichComment, getCommentById, getPostById, getReactionCounts, mapComment, now } from "../db/repository.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

export const commentRouter = Router();

async function listPostComments(postId) {
  const { data, error } = await supabase
    .from("comments")
    .select("*, users(name)")
    .eq("post_id", postId)
    .eq("is_deleted", false)
    .order("created_at", { ascending: true });
  throwIfSupabaseError(error);
  return (data || []).map((row) => mapComment(row, { authorName: row.users?.name }));
}

async function getCommentWithAuthor(id) {
  const { data, error } = await supabase.from("comments").select("*, users(name)").eq("id", id).maybeSingle();
  throwIfSupabaseError(error);
  return data ? mapComment(data, { authorName: data.users?.name }) : null;
}

commentRouter.get("/post/:postId", async (req, res, next) => {
  try {
    return res.json({ comments: await listPostComments(req.params.postId) });
  } catch (error) {
    return next(error);
  }
});

commentRouter.post("/post/:postId", authMiddleware, async (req, res, next) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ message: "댓글 내용은 필수입니다." });

  try {
    const post = await getPostById(req.params.postId);
    if (!post) return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });

    const id = `comment-${Date.now()}`;
    const { error } = await supabase.from("comments").insert({
      id,
      post_id: post.id,
      author_id: req.user.id,
      parent_id: null,
      content,
      like_count: 0,
      dislike_count: 0,
      is_deleted: false,
    });
    throwIfSupabaseError(error);

    return res.status(201).json({ comment: await getCommentWithAuthor(id) });
  } catch (error) {
    return next(error);
  }
});

commentRouter.post("/:commentId/replies", authMiddleware, async (req, res, next) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ message: "답글 내용은 필수입니다." });

  try {
    const parent = await getCommentById(req.params.commentId);
    if (!parent) return res.status(404).json({ message: "댓글을 찾을 수 없습니다." });

    const id = `comment-${Date.now()}`;
    const { error } = await supabase.from("comments").insert({
      id,
      post_id: parent.post_id,
      author_id: req.user.id,
      parent_id: parent.id,
      content,
      like_count: 0,
      dislike_count: 0,
      is_deleted: false,
    });
    throwIfSupabaseError(error);

    return res.status(201).json({ comment: await getCommentWithAuthor(id) });
  } catch (error) {
    return next(error);
  }
});

commentRouter.patch("/:id", authMiddleware, async (req, res, next) => {
  try {
    const comment = await getCommentById(req.params.id);
    if (!comment) return res.status(404).json({ message: "댓글을 찾을 수 없습니다." });
    if (comment.author_id !== req.user.id) return res.status(403).json({ message: "본인 댓글만 수정할 수 있습니다." });

    const { error } = await supabase
      .from("comments")
      .update({ content: req.body.content ?? comment.content, updated_at: now() })
      .eq("id", comment.id);
    throwIfSupabaseError(error);

    return res.json({ comment: await getCommentWithAuthor(comment.id) });
  } catch (error) {
    return next(error);
  }
});

commentRouter.delete("/:id", authMiddleware, async (req, res, next) => {
  try {
    const comment = await getCommentById(req.params.id);
    if (!comment) return res.status(404).json({ message: "댓글을 찾을 수 없습니다." });
    if (comment.author_id !== req.user.id) return res.status(403).json({ message: "본인 댓글만 삭제할 수 있습니다." });

    const { data: rows, error: rowsError } = await supabase.from("comments").select("id,parent_id").eq("post_id", comment.post_id);
    throwIfSupabaseError(rowsError);

    const childrenByParent = (rows || []).reduce((grouped, row) => {
      if (!row.parent_id) return grouped;
      return { ...grouped, [row.parent_id]: [...(grouped[row.parent_id] || []), row.id] };
    }, {});
    const collect = (id) => [id, ...(childrenByParent[id] || []).flatMap(collect)];
    const ids = collect(comment.id);

    const { error } = await supabase.from("comments").update({ is_deleted: true, updated_at: now() }).in("id", ids);
    throwIfSupabaseError(error);
    return res.json({ message: "댓글이 삭제되었습니다.", deletedCount: ids.length });
  } catch (error) {
    return next(error);
  }
});

commentRouter.post("/:id/reactions/:type", authMiddleware, async (req, res, next) => {
  const { type } = req.params;
  if (!["like", "dislike"].includes(type)) return res.status(400).json({ message: "올바르지 않은 반응입니다." });

  try {
    const comment = await getCommentById(req.params.id);
    if (!comment) return res.status(404).json({ message: "댓글을 찾을 수 없습니다." });

    const { data: existing, error: existingError } = await supabase
      .from("comment_reactions")
      .select("*")
      .eq("comment_id", comment.id)
      .eq("user_id", req.user.id)
      .maybeSingle();
    throwIfSupabaseError(existingError);

    if (existing?.type === type) {
      const { error } = await supabase.from("comment_reactions").delete().eq("id", existing.id);
      throwIfSupabaseError(error);
    } else if (existing) {
      const { error } = await supabase.from("comment_reactions").update({ type, updated_at: now() }).eq("id", existing.id);
      throwIfSupabaseError(error);
    } else {
      const { error } = await supabase.from("comment_reactions").insert({
        id: `reaction-${Date.now()}`,
        comment_id: comment.id,
        user_id: req.user.id,
        type,
      });
      throwIfSupabaseError(error);
    }

    const counts = await getReactionCounts("comment_reactions", "comment_id", comment.id);
    const { error } = await supabase
      .from("comments")
      .update({ like_count: counts.likeCount, dislike_count: counts.dislikeCount, updated_at: now() })
      .eq("id", comment.id);
    throwIfSupabaseError(error);

    return res.json({ comment: await enrichComment({ ...comment, like_count: counts.likeCount, dislike_count: counts.dislikeCount }) });
  } catch (error) {
    return next(error);
  }
});

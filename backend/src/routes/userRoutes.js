import { Router } from "express";
import { supabase, throwIfSupabaseError } from "../db/client.js";
import { mapPost, now, publicUser } from "../db/repository.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

export const userRouter = Router();

userRouter.get("/me", authMiddleware, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

userRouter.patch("/me", authMiddleware, async (req, res, next) => {
  const { name, bio } = req.body;

  try {
    const { data, error } = await supabase
      .from("users")
      .update({
        name: name || req.user.name,
        bio: bio ?? req.user.bio,
        updated_at: now(),
      })
      .eq("id", req.user.id)
      .select("*")
      .single();
    throwIfSupabaseError(error);

    return res.json({ user: publicUser(data) });
  } catch (error) {
    return next(error);
  }
});

userRouter.get("/me/posts", authMiddleware, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("author_id", req.user.id)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });
    throwIfSupabaseError(error);

    return res.json({ posts: (data || []).map((post) => mapPost(post)) });
  } catch (error) {
    return next(error);
  }
});

userRouter.delete("/me", authMiddleware, async (req, res, next) => {
  try {
    const { data: userPosts, error: postError } = await supabase.from("posts").select("id").eq("author_id", req.user.id);
    throwIfSupabaseError(postError);
    const postIds = (userPosts || []).map((post) => post.id);

    if (postIds.length) {
      const { data: postComments, error: postCommentsError } = await supabase.from("comments").select("id").in("post_id", postIds);
      throwIfSupabaseError(postCommentsError);
      const postCommentIds = (postComments || []).map((comment) => comment.id);

      if (postCommentIds.length) {
        const { error } = await supabase.from("comment_reactions").delete().in("comment_id", postCommentIds);
        throwIfSupabaseError(error);
      }

      let result = await supabase.from("comments").delete().in("post_id", postIds);
      throwIfSupabaseError(result.error);
      result = await supabase.from("post_reactions").delete().in("post_id", postIds);
      throwIfSupabaseError(result.error);
      result = await supabase.from("posts").delete().in("id", postIds);
      throwIfSupabaseError(result.error);
    }

    const { data: ownComments, error: ownCommentsError } = await supabase.from("comments").select("id").eq("author_id", req.user.id);
    throwIfSupabaseError(ownCommentsError);
    const ownCommentIds = (ownComments || []).map((comment) => comment.id);

    if (ownCommentIds.length) {
      const { error } = await supabase.from("comment_reactions").delete().in("comment_id", ownCommentIds);
      throwIfSupabaseError(error);
    }

    let result = await supabase.from("comments").delete().eq("author_id", req.user.id);
    throwIfSupabaseError(result.error);
    result = await supabase.from("comment_reactions").delete().eq("user_id", req.user.id);
    throwIfSupabaseError(result.error);
    result = await supabase.from("post_reactions").delete().eq("user_id", req.user.id);
    throwIfSupabaseError(result.error);
    result = await supabase.from("users").delete().eq("id", req.user.id);
    throwIfSupabaseError(result.error);

    return res.json({ message: "회원탈퇴가 완료되었습니다." });
  } catch (error) {
    return next(error);
  }
});

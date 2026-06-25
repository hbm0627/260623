import { supabase, throwIfSupabaseError } from "./client.js";

export const now = () => new Date().toISOString();

export function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    bio: user.bio || "",
    isActive: user.is_active ?? user.isActive ?? true,
  };
}

export function mapPost(row, extras = {}) {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    imageUrl: row.image_url || "",
    authorId: row.author_id,
    authorName: extras.authorName || row.author_name || row.users?.name || "unknown",
    viewCount: row.view_count || 0,
    likeCount: extras.likeCount ?? row.like_count ?? 0,
    dislikeCount: extras.dislikeCount ?? row.dislike_count ?? 0,
    commentCount: extras.commentCount ?? row.comment_count ?? 0,
    isDeleted: Boolean(row.is_deleted),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapComment(row, extras = {}) {
  return {
    id: row.id,
    postId: row.post_id,
    postTitle: extras.postTitle || row.post_title || row.posts?.title || "",
    authorId: row.author_id,
    authorName: extras.authorName || row.author_name || row.users?.name || "unknown",
    parentId: row.parent_id,
    content: row.content,
    likeCount: row.like_count || 0,
    dislikeCount: row.dislike_count || 0,
    isDeleted: Boolean(row.is_deleted),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getUserById(id) {
  const { data, error } = await supabase.from("users").select("*").eq("id", id).eq("is_active", true).maybeSingle();
  throwIfSupabaseError(error);
  return data;
}

export async function getUserByEmail(email) {
  const { data, error } = await supabase.from("users").select("*").eq("email", email).maybeSingle();
  throwIfSupabaseError(error);
  return data;
}

export async function countRows(table, apply = (query) => query) {
  const { count, error } = await apply(supabase.from(table).select("id", { count: "exact", head: true }));
  throwIfSupabaseError(error);
  return count || 0;
}

export async function getReactionCounts(table, foreignKey, id) {
  const [likeCount, dislikeCount] = await Promise.all([
    countRows(table, (query) => query.eq(foreignKey, id).eq("type", "like")),
    countRows(table, (query) => query.eq(foreignKey, id).eq("type", "dislike")),
  ]);
  return { likeCount, dislikeCount };
}

export async function getCommentCount(postId, includeDeleted = false) {
  return countRows("comments", (query) => {
    const scoped = query.eq("post_id", postId);
    return includeDeleted ? scoped : scoped.eq("is_deleted", false);
  });
}

export async function enrichPost(row) {
  const [author, commentCount, reactionCounts] = await Promise.all([
    row.author_id ? getUserById(row.author_id) : null,
    getCommentCount(row.id),
    getReactionCounts("post_reactions", "post_id", row.id),
  ]);
  return mapPost(row, {
    authorName: author?.name,
    commentCount,
    ...reactionCounts,
  });
}

export async function getPostById(id, includeDeleted = false) {
  let query = supabase.from("posts").select("*").eq("id", id);
  if (!includeDeleted) query = query.eq("is_deleted", false);
  const { data, error } = await query.maybeSingle();
  throwIfSupabaseError(error);
  return data;
}

export async function enrichComment(row) {
  const [author, post] = await Promise.all([
    row.author_id ? getUserById(row.author_id) : null,
    row.post_id ? getPostById(row.post_id, true) : null,
  ]);
  return mapComment(row, { authorName: author?.name, postTitle: post?.title });
}

export async function getCommentById(id, includeDeleted = false) {
  let query = supabase.from("comments").select("*").eq("id", id);
  if (!includeDeleted) query = query.eq("is_deleted", false);
  const { data, error } = await query.maybeSingle();
  throwIfSupabaseError(error);
  return data;
}

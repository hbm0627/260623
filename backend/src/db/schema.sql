create table if not exists public.users (
  id text primary key,
  name text not null,
  email text not null unique,
  password text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  bio text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id text primary key,
  title text not null,
  content text not null,
  image_url text,
  author_id text not null references public.users(id) on delete cascade,
  view_count integer not null default 0,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_posts_author_id on public.posts(author_id);
create index if not exists idx_posts_is_deleted on public.posts(is_deleted);

create table if not exists public.post_reactions (
  id text primary key,
  post_id text not null references public.posts(id) on delete cascade,
  user_id text not null references public.users(id) on delete cascade,
  type text not null check (type in ('like', 'dislike')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create index if not exists idx_post_reactions_post_id on public.post_reactions(post_id);
create index if not exists idx_post_reactions_user_id on public.post_reactions(user_id);

create table if not exists public.comments (
  id text primary key,
  post_id text not null references public.posts(id) on delete cascade,
  author_id text not null references public.users(id) on delete cascade,
  parent_id text references public.comments(id) on delete cascade,
  content text not null,
  like_count integer not null default 0,
  dislike_count integer not null default 0,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_comments_post_id on public.comments(post_id);
create index if not exists idx_comments_author_id on public.comments(author_id);
create index if not exists idx_comments_parent_id on public.comments(parent_id);
create index if not exists idx_comments_is_deleted on public.comments(is_deleted);

create table if not exists public.comment_reactions (
  id text primary key,
  comment_id text not null references public.comments(id) on delete cascade,
  user_id text not null references public.users(id) on delete cascade,
  type text not null check (type in ('like', 'dislike')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (comment_id, user_id)
);

create index if not exists idx_comment_reactions_comment_id on public.comment_reactions(comment_id);
create index if not exists idx_comment_reactions_user_id on public.comment_reactions(user_id);

create table if not exists public.readings (
  id text primary key,
  type text not null,
  user_id text not null references public.users(id) on delete cascade,
  question text not null default '',
  topic text not null default '',
  card jsonb not null,
  interpretation jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_readings_user_id on public.readings(user_id);
create index if not exists idx_readings_created_at on public.readings(created_at desc);

create table if not exists public.analyses (
  id text primary key,
  user_id text not null default 'local-test-user',
  input jsonb not null,
  summary text not null,
  highlights jsonb not null,
  detail text not null,
  disclaimer text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_analyses_created_at on public.analyses(created_at desc);

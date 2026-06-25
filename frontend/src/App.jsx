import { Link, Navigate, NavLink, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  BarChart3,
  Eye,
  ImagePlus,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  MessageCircle,
  ShieldCheck,
  ThumbsDown,
  ThumbsUp,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import kimSmiling from "./assets/kim-smiling.svg";
import leePhotoFace from "./assets/lee-photo-face.svg";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://mslxzygqdumhtrzhddvc.functions.supabase.co/api";
const AUTH_STORAGE_KEY = "dino-auth";

function getStoredAuth() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || "null");
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

async function apiRequest(path, options = {}) {
  const auth = getStoredAuth();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(auth?.token ? { Authorization: `Bearer ${auth.token}` } : {}),
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "요청을 처리할 수 없습니다.");
  return data;
}

function resolveMediaUrl(value) {
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:")) return value;
  return `${API_BASE_URL.replace(/\/api$/, "")}${value}`;
}

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const year = String(date.getFullYear()).slice(2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${year}.${month}.${day} ${hour}:${minute}`;
}

function isEdited(item) {
  if (!item?.createdAt || !item?.updatedAt) return false;
  return new Date(item.updatedAt).getTime() !== new Date(item.createdAt).getTime();
}

function displayTimestamp(item) {
  return formatDateTime(isEdited(item) ? item.updatedAt : item.createdAt);
}

function Header({ auth, onLogout }) {
  const [open, setOpen] = useState(false);
  const navItems = [
    ["홈", "/"],
    ["게시판", "/boards"],
    ["프로필", "/profile"],
  ];

  return (
    <header className="site-header">
      <Link className="brand" to="/">
        <span className="brand-mark">D</span>
        <span>Dino Cave</span>
      </Link>
      <button className="icon-button menu-button" onClick={() => setOpen((value) => !value)} aria-label="메뉴 열기">
        <Menu size={22} />
      </button>
      <nav className={`site-nav ${open ? "is-open" : ""}`}>
        {navItems.map(([label, path]) => (
          <NavLink key={path} to={path} onClick={() => setOpen(false)}>
            {label}
          </NavLink>
        ))}
        {auth?.user ? (
          <button className="nav-action" type="button" onClick={onLogout}>
            <LogOut size={16} />
            로그아웃
          </button>
        ) : (
          <>
            <NavLink to="/login" onClick={() => setOpen(false)}>
              로그인
            </NavLink>
            <NavLink to="/signup" onClick={() => setOpen(false)}>
              회원가입
            </NavLink>
          </>
        )}
      </nav>
    </header>
  );
}

function DinoGuide({ mood = "hi", politicalFaces = false }) {
  const [line, setLine] = useState("안녕! 나를 클릭하면 동굴 안내를 해줄게.");
  const lines = {
    hi: ["오늘도 좋은 탐험이야!", "게시판에 새 돌판 기록을 남겨봐.", "모바일에서도 잘 보이게 만들 거야."],
    board: ["글은 로그인한 친구만 쓸 수 있어.", "댓글과 답글도 잊지 마!", "좋아요는 발자국으로 남겨둘게."],
    admin: ["관리자 공간은 일반 페이지와 분리되어 있어.", "게시물과 회원 상태를 한눈에 확인해.", "삭제 전에는 상태를 먼저 확인해."],
  };

  function talk() {
    const list = lines[mood] ?? lines.hi;
    setLine(list[Math.floor(Math.random() * list.length)]);
  }

  return (
    <div className="dino-widget">
      <div className="dino-stage">
        <button className="dino" onClick={talk} aria-label="공룡과 대화하기">
          <span className={`dino-head ${politicalFaces ? "has-photo" : ""}`}>
            {politicalFaces && <img src={leePhotoFace} alt="이재명 얼굴" />}
          </span>
          <span className="dino-body" />
          <span className="dino-tail" />
          <span className="dino-leg leg-one" />
          <span className="dino-leg leg-two" />
        </button>
        {politicalFaces && (
          <div className="kim-sidekick" aria-label="웃고 있는 김정은">
            <img src={kimSmiling} alt="웃고 있는 김정은" />
          </div>
        )}
      </div>
      <div className="speech-bubble">{line}</div>
    </div>
  );
}

function HomePage({ auth }) {
  return (
    <main>
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">Stone age personal website</p>
          <h1>귀여운 공룡이 안내하는 나만의 동굴 홈페이지</h1>
          <p>회원 계정으로 로그인하고, 게시판과 프로필을 실제 API 데이터 기준으로 이용할 수 있습니다.</p>
          <div className="hero-actions">
            <Link className="primary-button" to="/boards">
              게시판 보기
            </Link>
            {auth?.user ? (
              <Link className="secondary-button" to="/profile">
                내 프로필
              </Link>
            ) : (
              <>
                <Link className="secondary-button" to="/login">
                  로그인
                </Link>
                <Link className="secondary-button" to="/signup">
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
        <DinoGuide politicalFaces />
      </section>

      <section className="feature-grid" aria-label="주요 기능">
        <FeatureCard title="회원 기능" text="회원가입, 일반 로그인, 프로필 수정을 제공합니다." icon={<UserPlus />} />
        <FeatureCard title="게시판" text="로그인한 유저가 게시글과 댓글 기능을 이용합니다." icon={<MessageCircle />} />
        <FeatureCard title="관리자" text="관리자 전용 로그인과 별도 대시보드로 운영 데이터를 확인합니다." icon={<ShieldCheck />} />
      </section>
    </main>
  );
}

function FeatureCard({ title, text, icon }) {
  return (
    <article className="feature-card">
      <div className="feature-icon">{icon}</div>
      <h2>{title}</h2>
      <p>{text}</p>
    </article>
  );
}

function BoardPage({ auth }) {
  const [posts, setPosts] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    apiRequest("/posts")
      .then((data) => setPosts(data.posts || []))
      .catch((error) => setMessage(error.message));
  }, []);

  return (
    <main className="page-shell">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Cave board</p>
          <h1>게시판</h1>
        </div>
        <Link className="primary-button compact" to={auth?.user ? "/boards/new" : "/login"}>
          {auth?.user ? "게시글 작성" : "로그인 후 글쓰기"}
        </Link>
      </div>
      {message && <p className="form-message">{message}</p>}
      {!auth?.user && (
        <section className="post-editor compact-editor">
          <p>로그인한 회원만 게시글을 작성할 수 있습니다.</p>
          <Link className="primary-button compact" to="/login">
            로그인
          </Link>
        </section>
      )}
      <div className="post-list">
        {posts.length ? (
          posts.map((post) => (
            <Link className="post-card post-link" to={`/boards/${post.id}`} key={post.id}>
              {post.imageUrl && <img className="post-card-image" src={resolveMediaUrl(post.imageUrl)} alt="" />}
              <h2>{post.title}</h2>
              <p>{post.content}</p>
              <div className="post-meta">
                <span>{post.authorName}</span>
                <span>조회 {post.viewCount}</span>
                <span>좋아요 {post.likeCount}</span>
                <span>싫어요 {post.dislikeCount}</span>
                <span>댓글+대댓글 {post.commentCount}</span>
              </div>
            </Link>
          ))
        ) : (
          <section className="empty-panel">
            <h2>아직 게시글이 없습니다</h2>
            <p>로그인 후 첫 게시글을 작성하면 이 목록에 표시됩니다.</p>
          </section>
        )}
      </div>
      <DinoGuide mood="board" />
    </main>
  );
}

function PostCreatePage({ auth }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", content: "", imageUrl: "" });
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  if (!auth?.token) return <Navigate to="/login" replace />;

  async function selectImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("이미지 파일만 첨부할 수 있습니다.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("이미지는 5MB 이하만 첨부할 수 있습니다.");
      return;
    }

    const payload = new FormData();
    payload.append("image", file);
    setUploading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/uploads/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${auth.token}` },
        body: payload,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "이미지 업로드에 실패했습니다.");
      setForm((current) => ({ ...current, imageUrl: data.imageUrl }));
    } catch (error) {
      setMessage(error.message);
    } finally {
      setUploading(false);
    }
  }

  async function createPost(event) {
    event.preventDefault();
    setMessage("");
    setSubmitting(true);

    try {
      const data = await apiRequest("/posts", {
        method: "POST",
        body: JSON.stringify(form),
      });
      navigate(`/boards/${data.post.id}`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page-shell">
      <div className="page-heading">
        <div>
          <p className="eyebrow">New record</p>
          <h1>게시글 작성</h1>
        </div>
        <Link className="secondary-button compact" to="/boards">
          목록으로
        </Link>
      </div>
      <section className="post-editor">
        <form className="auth-form" onSubmit={createPost}>
          <label>
            제목
            <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
          </label>
          <label>
            내용
            <textarea
              value={form.content}
              onChange={(event) => setForm({ ...form, content: event.target.value })}
              rows={9}
              required
            />
          </label>
          <label>
            이미지 URL
            <input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={form.imageUrl.startsWith("/media/") ? "" : form.imageUrl}
              onChange={(event) => setForm({ ...form, imageUrl: event.target.value })}
            />
          </label>
          <label>
            이미지 직접 업로드
            <input type="file" accept="image/*" onChange={selectImage} />
          </label>
          {uploading && <p className="form-message">이미지를 업로드하고 있습니다.</p>}
          {form.imageUrl && (
            <div className="image-preview">
              <img src={resolveMediaUrl(form.imageUrl)} alt="첨부 이미지 미리보기" />
              <button className="secondary-button compact" type="button" onClick={() => setForm({ ...form, imageUrl: "" })}>
                이미지 제거
              </button>
            </div>
          )}
          {message && <p className="form-message">{message}</p>}
          <button className="primary-button" type="submit" disabled={submitting}>
            <ImagePlus size={18} />
            {submitting ? "저장 중" : "게시글 등록"}
          </button>
        </form>
      </section>
    </main>
  );
}

function BoardDetailPage({ auth }) {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState("");
  const [replyDrafts, setReplyDrafts] = useState({});
  const [editingCommentId, setEditingCommentId] = useState("");
  const [commentEditDraft, setCommentEditDraft] = useState("");
  const [message, setMessage] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const fetchedPostIds = useRef(new Set());

  useEffect(() => {
    if (fetchedPostIds.current.has(id)) return;
    fetchedPostIds.current.add(id);

    Promise.all([apiRequest(`/posts/${id}`), apiRequest(`/posts/${id}/comments`)])
      .then(([postData, commentData]) => {
        setPost(postData.post);
        setComments(commentData.comments || []);
      })
      .catch((error) => {
        fetchedPostIds.current.delete(id);
        setMessage(error.message);
      });
  }, [id]);

  async function createComment(event) {
    event.preventDefault();
    setActionMessage("");
    setSubmittingComment(true);

    try {
      const data = await apiRequest(`/comments/post/${id}`, {
        method: "POST",
        body: JSON.stringify({ content: commentContent }),
      });
      setComments((current) => [...current, data.comment]);
      setCommentContent("");
      setShowCommentForm(false);
      setPost((current) => (current ? { ...current, commentCount: current.commentCount + 1 } : current));
    } catch (error) {
      setActionMessage(error.message);
    } finally {
      setSubmittingComment(false);
    }
  }

  async function createReply(event, commentId) {
    event.preventDefault();
    const content = replyDrafts[commentId] || "";
    if (!content.trim()) return;
    setActionMessage("");

    try {
      const data = await apiRequest(`/comments/${commentId}/replies`, {
        method: "POST",
        body: JSON.stringify({ content }),
      });
      setComments((current) => [...current, data.comment]);
      setReplyDrafts((current) => ({ ...current, [commentId]: "" }));
      setPost((current) => (current ? { ...current, commentCount: current.commentCount + 1 } : current));
    } catch (error) {
      setActionMessage(error.message);
    }
  }

  async function reactToPost(type) {
    if (!auth?.user) {
      setActionMessage("로그인 후 반응을 남길 수 있습니다.");
      return;
    }

    setActionMessage("");

    try {
      const data = await apiRequest(`/posts/${id}/reactions/${type}`, { method: "POST" });
      setPost((current) =>
        current
          ? {
              ...current,
              likeCount: data.counts.likeCount,
              dislikeCount: data.counts.dislikeCount,
            }
          : current,
      );
    } catch (error) {
      setActionMessage(error.message);
    }
  }

  async function reactToComment(commentId, type) {
    if (!auth?.user) {
      setActionMessage("로그인 후 반응을 남길 수 있습니다.");
      return;
    }

    setActionMessage("");

    try {
      const data = await apiRequest(`/comments/${commentId}/reactions/${type}`, { method: "POST" });
      setComments((current) => current.map((comment) => (comment.id === commentId ? data.comment : comment)));
    } catch (error) {
      setActionMessage(error.message);
    }
  }

  function startCommentEdit(comment) {
    setEditingCommentId(comment.id);
    setCommentEditDraft(comment.content);
  }

  async function updateComment(event, commentId) {
    event.preventDefault();
    setActionMessage("");

    try {
      const data = await apiRequest(`/comments/${commentId}`, {
        method: "PATCH",
        body: JSON.stringify({ content: commentEditDraft }),
      });
      setComments((current) => current.map((comment) => (comment.id === commentId ? data.comment : comment)));
      setEditingCommentId("");
      setCommentEditDraft("");
    } catch (error) {
      setActionMessage(error.message);
    }
  }

  function collectCommentTreeIds(commentId, groupedReplies) {
    return [commentId, ...(groupedReplies[commentId] || []).flatMap((reply) => collectCommentTreeIds(reply.id, groupedReplies))];
  }

  async function deleteComment(commentId) {
    if (!window.confirm("댓글을 삭제할까요?")) return;
    setActionMessage("");

    try {
      const data = await apiRequest(`/comments/${commentId}`, { method: "DELETE" });
      const deletedIds = new Set(collectCommentTreeIds(commentId, repliesByParentId));
      setComments((current) => current.filter((comment) => !deletedIds.has(comment.id)));
      setPost((current) => (current ? { ...current, commentCount: Math.max(0, current.commentCount - (data.deletedCount || deletedIds.size)) } : current));
    } catch (error) {
      setActionMessage(error.message);
    }
  }

  const commentsById = comments.reduce((grouped, comment) => ({ ...grouped, [comment.id]: comment }), {});
  const repliesByParentId = comments.reduce((grouped, comment) => {
    if (!comment.parentId) return grouped;
    return { ...grouped, [comment.parentId]: [...(grouped[comment.parentId] || []), comment] };
  }, {});
  const rootComments = comments.filter((comment) => !comment.parentId);

  function renderCommentThread(comment, depth = 0) {
    const parent = comment.parentId ? commentsById[comment.parentId] : null;
    const children = repliesByParentId[comment.id] || [];

    return (
      <article className="comment-thread" key={comment.id}>
        <div className={`comment-card ${depth > 0 ? "reply-card" : ""}`} style={{ "--reply-depth": Math.min(depth, 4) }}>
          <div className="comment-head">
            <strong>{comment.authorName}</strong>
            <time>
              {displayTimestamp(comment)}
              {isEdited(comment) ? " 수정함" : ""}
            </time>
          </div>
          <p className="reply-target">
            {parent
              ? `${parent.authorName || "댓글"}님의 댓글 "${(parent.content || "").slice(0, 32)}${(parent.content || "").length > 32 ? "..." : ""}"에 남긴 답글`
              : `게시글 "${post.title}"에 남긴 댓글`}
          </p>
          {editingCommentId === comment.id ? (
            <form className="comment-edit-form" onSubmit={(event) => updateComment(event, comment.id)}>
              <textarea value={commentEditDraft} onChange={(event) => setCommentEditDraft(event.target.value)} rows={3} required />
              <div className="profile-post-actions">
                <button className="primary-button compact" type="submit">
                  저장
                </button>
                <button className="secondary-button compact" type="button" onClick={() => setEditingCommentId("")}>
                  취소
                </button>
              </div>
            </form>
          ) : (
            <p>{comment.content}</p>
          )}
          <div className="reaction-row">
            <button type="button" onClick={() => reactToComment(comment.id, "like")}>
              <ThumbsUp size={16} /> {comment.likeCount}
            </button>
            <button type="button" onClick={() => reactToComment(comment.id, "dislike")}>
              <ThumbsDown size={16} /> {comment.dislikeCount}
            </button>
            {auth?.user?.id === comment.authorId && editingCommentId !== comment.id && (
              <>
                <button type="button" onClick={() => startCommentEdit(comment)}>
                  수정
                </button>
                <button type="button" onClick={() => deleteComment(comment.id)}>
                  삭제
                </button>
              </>
            )}
          </div>
        </div>
        {auth?.user && (
          <form className="reply-form" style={{ "--reply-depth": Math.min(depth + 1, 4) }} onSubmit={(event) => createReply(event, comment.id)}>
            <input
              value={replyDrafts[comment.id] || ""}
              onChange={(event) => setReplyDrafts({ ...replyDrafts, [comment.id]: event.target.value })}
              placeholder={`${comment.authorName}님에게 답글 쓰기`}
            />
            <button className="secondary-button compact" type="submit">
              답글 등록
            </button>
          </form>
        )}
        {children.map((child) => renderCommentThread(child, depth + 1))}
      </article>
    );
  }

  if (message) {
    return (
      <main className="page-shell">
        <p className="eyebrow">Missing stone</p>
        <h1>게시글을 찾을 수 없습니다</h1>
        <p className="form-message">{message}</p>
        <Link className="primary-button compact" to="/boards">
          게시판으로 돌아가기
        </Link>
      </main>
    );
  }

  if (!post) {
    return <main className="page-shell">불러오는 중...</main>;
  }

  return (
    <main className="page-shell detail-layout">
      <Link className="secondary-button compact" to="/boards">
        게시판으로 돌아가기
      </Link>
      <article className="detail-card">
        <p className="eyebrow">Stone record</p>
        <h1>{post.title}</h1>
        <div className="post-meta detail-meta">
          <span>{post.authorName}</span>
          <span>
            {displayTimestamp(post)}
            {isEdited(post) ? " 수정함" : ""}
          </span>
          <span>
            <Eye size={16} /> 조회 {post.viewCount}
          </span>
          <span>좋아요 {post.likeCount}</span>
          <span>싫어요 {post.dislikeCount}</span>
          <span>댓글+대댓글 {post.commentCount}</span>
        </div>
        <div className="reaction-row detail-reactions">
          <button type="button" onClick={() => reactToPost("like")}>
            <ThumbsUp size={16} /> 좋아요 {post.likeCount}
          </button>
          <button type="button" onClick={() => reactToPost("dislike")}>
            <ThumbsDown size={16} /> 싫어요 {post.dislikeCount}
          </button>
        </div>
        {post.imageUrl && <img className="detail-image" src={resolveMediaUrl(post.imageUrl)} alt="" />}
        <p className="detail-content">{post.content}</p>
      </article>

      <section className="comments-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Comments</p>
            <h2>댓글과 대댓글</h2>
          </div>
          <button
            className="primary-button compact"
            type="button"
            onClick={() => (auth?.user ? setShowCommentForm((value) => !value) : setActionMessage("로그인 후 댓글을 작성할 수 있습니다."))}
          >
            댓글 작성
          </button>
        </div>
        {actionMessage && <p className="form-message">{actionMessage}</p>}
        {auth?.user && showCommentForm ? (
          <form className="comment-form" onSubmit={createComment}>
            <textarea
              value={commentContent}
              onChange={(event) => setCommentContent(event.target.value)}
              placeholder="댓글을 입력하세요"
              rows={3}
              required
            />
            <button className="primary-button compact" type="submit" disabled={submittingComment}>
              {submittingComment ? "등록 중" : "댓글 등록"}
            </button>
          </form>
        ) : !auth?.user ? (
          <div className="comment-login">
            <p>로그인한 회원만 댓글을 작성할 수 있습니다.</p>
            <Link className="primary-button compact" to="/login">
              로그인
            </Link>
          </div>
        ) : null}
        <div className="comment-list">
          {rootComments.length ? (
            rootComments.map((comment) => renderCommentThread(comment))
          ) : (
            <p>아직 댓글이 없습니다.</p>
          )}
        </div>
      </section>
    </main>
  );
}

function LoginPage({ onLogin }) {
  return <AuthForm mode="login" onLogin={onLogin} />;
}

function SignupPage({ onLogin }) {
  return <AuthForm mode="signup" onLogin={onLogin} />;
}

function AuthForm({ mode, onLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", passwordConfirm: "" });
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isSignup = mode === "signup";

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    setSubmitting(true);

    if (isSignup && form.password !== form.passwordConfirm) {
      setMessage("비밀번호가 일치하지 않습니다.");
      setSubmitting(false);
      return;
    }

    try {
      const data = await apiRequest(isSignup ? "/auth/signup" : "/auth/login", {
        method: "POST",
        body: JSON.stringify(
          isSignup
            ? { name: form.name, email: form.email, password: form.password }
            : { email: form.email, password: form.password },
        ),
      });
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
      onLogin(data);
      navigate("/profile");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-panel">
        <p className="eyebrow">{isSignup ? "New member" : "Member login"}</p>
        <h1>{isSignup ? "회원가입" : "로그인"}</h1>
        <form className="auth-form" onSubmit={submit}>
          {isSignup && (
            <label>
              이름
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            </label>
          )}
          <label>
            이메일
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              required
            />
          </label>
          <label>
            비밀번호
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
            />
          </label>
          {isSignup && (
            <label>
              비밀번호 확인
              <input
                type="password"
                value={form.passwordConfirm}
                onChange={(event) => setForm({ ...form, passwordConfirm: event.target.value })}
                required
              />
            </label>
          )}
          {message && <p className="form-message">{message}</p>}
          <button className="primary-button" type="submit" disabled={submitting}>
            {isSignup ? <UserPlus size={18} /> : <LogIn size={18} />}
            {submitting ? "처리 중" : isSignup ? "회원가입" : "로그인"}
          </button>
        </form>
      </section>
      <DinoGuide />
    </main>
  );
}

function ProfilePage({ auth, onAuthUpdate, onLogout }) {
  const [activeTab, setActiveTab] = useState("info");
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState(auth?.user || null);
  const [myPosts, setMyPosts] = useState([]);
  const [editingPostId, setEditingPostId] = useState("");
  const [postDraft, setPostDraft] = useState({ title: "", content: "", imageUrl: "" });
  const [uploadingPostId, setUploadingPostId] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!auth?.token) return;
    Promise.all([apiRequest("/auth/me"), apiRequest("/users/me/posts")])
      .then(([meData, postsData]) => {
        setProfile(meData.user);
        setMyPosts(postsData.posts || []);
      })
      .catch((error) => setMessage(error.message));
  }, [auth?.token]);

  async function updateProfile(event) {
    event.preventDefault();
    setMessage("");

    try {
      const data = await apiRequest("/users/me", {
        method: "PATCH",
        body: JSON.stringify({ name: profile.name, bio: profile.bio }),
      });
      const nextAuth = { ...auth, user: data.user };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextAuth));
      onAuthUpdate(nextAuth);
      setProfile(data.user);
      setEditing(false);
    } catch (error) {
      setMessage(error.message);
    }
  }

  function startPostEdit(post) {
    setEditingPostId(post.id);
    setPostDraft({ title: post.title, content: post.content, imageUrl: post.imageUrl || "" });
  }

  async function selectPostImage(event, postId) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("이미지 파일만 첨부할 수 있습니다.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("이미지는 5MB 이하만 첨부할 수 있습니다.");
      return;
    }

    const payload = new FormData();
    payload.append("image", file);
    setUploadingPostId(postId);
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/uploads/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${auth.token}` },
        body: payload,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "이미지 업로드에 실패했습니다.");
      setPostDraft((current) => ({ ...current, imageUrl: data.imageUrl }));
    } catch (error) {
      setMessage(error.message);
    } finally {
      setUploadingPostId("");
    }
  }

  async function updatePost(event, postId) {
    event.preventDefault();
    setMessage("");

    try {
      const data = await apiRequest(`/posts/${postId}`, {
        method: "PATCH",
        body: JSON.stringify(postDraft),
      });
      setMyPosts((current) => current.map((post) => (post.id === postId ? { ...post, ...data.post } : post)));
      setEditingPostId("");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function deletePost(postId) {
    if (!window.confirm("게시글을 삭제할까요?")) return;
    setMessage("");

    try {
      await apiRequest(`/posts/${postId}`, { method: "DELETE" });
      setMyPosts((current) => current.filter((post) => post.id !== postId));
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function withdrawAccount() {
    const confirmed = window.confirm(
      "정말 회원탈퇴를 진행할까요? 탈퇴하면 계정 정보, 게시글, 댓글, 대댓글, 좋아요/싫어요 기록이 모두 삭제되며 복구할 수 없습니다.",
    );

    if (!confirmed) return;
    setMessage("");

    try {
      await apiRequest("/users/me", { method: "DELETE" });
      onLogout("/");
    } catch (error) {
      setMessage(error.message);
    }
  }

  if (!auth?.token) return <Navigate to="/login" replace />;
  if (!profile) return <main className="page-shell">프로필을 불러오는 중...</main>;

  return (
    <main className="page-shell">
      <p className="eyebrow">My account</p>
      <h1>프로필</h1>
      {message && <p className="form-message">{message}</p>}
      <section className="profile-card">
        <div className="avatar">{profile.name.slice(0, 1)}</div>
        <div>
          <h2>{profile.name}</h2>
          <p>{profile.bio || "자기소개가 없습니다."}</p>
        </div>
      </section>
      <section className="danger-zone">
        <div>
          <h2>회원탈퇴</h2>
          <p>탈퇴하면 모든 계정 정보와 작성 기록이 삭제됩니다.</p>
        </div>
        <button className="danger-button" type="button" onClick={withdrawAccount}>
          회원탈퇴
        </button>
      </section>

      <div className="profile-tabs" role="tablist" aria-label="프로필 메뉴">
        <button className={activeTab === "info" ? "is-active" : ""} onClick={() => setActiveTab("info")} type="button">
          내 프로필
        </button>
        <button className={activeTab === "posts" ? "is-active" : ""} onClick={() => setActiveTab("posts")} type="button">
          내 게시글
        </button>
      </div>

      {activeTab === "info" && (
        <section className="profile-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Profile info</p>
              <h2>내 프로필</h2>
            </div>
            <button className="primary-button compact" onClick={() => setEditing((value) => !value)} type="button">
              {editing ? "수정 취소" : "프로필 수정"}
            </button>
          </div>

          {editing ? (
            <form className="auth-form profile-form" onSubmit={updateProfile}>
              <label>
                이름
                <input value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} />
              </label>
              <label>
                자기소개
                <input value={profile.bio || ""} onChange={(event) => setProfile({ ...profile, bio: event.target.value })} />
              </label>
              <button className="primary-button" type="submit">
                저장
              </button>
            </form>
          ) : (
            <dl className="profile-list">
              <div>
                <dt>이름</dt>
                <dd>{profile.name}</dd>
              </div>
              <div>
                <dt>이메일</dt>
                <dd>{profile.email}</dd>
              </div>
              <div>
                <dt>권한</dt>
                <dd>{profile.role}</dd>
              </div>
              <div>
                <dt>자기소개</dt>
                <dd>{profile.bio || "없음"}</dd>
              </div>
            </dl>
          )}
        </section>
      )}

      {activeTab === "posts" && (
        <section className="profile-panel">
          <p className="eyebrow">My records</p>
          <h2>내 게시글</h2>
          <div className="post-list">
            {myPosts.length ? (
              myPosts.map((post) => (
                <article className="post-card my-post-card" key={post.id}>
                  {editingPostId === post.id ? (
                    <form className="auth-form" onSubmit={(event) => updatePost(event, post.id)}>
                      <label>
                        제목
                        <input value={postDraft.title} onChange={(event) => setPostDraft({ ...postDraft, title: event.target.value })} required />
                      </label>
                      <label>
                        내용
                        <textarea
                          value={postDraft.content}
                          onChange={(event) => setPostDraft({ ...postDraft, content: event.target.value })}
                          rows={9}
                          required
                        />
                      </label>
                      <label>
                        이미지 URL
                        <input
                          type="url"
                          placeholder="https://example.com/image.jpg"
                          value={postDraft.imageUrl.startsWith("/media/") ? "" : postDraft.imageUrl}
                          onChange={(event) => setPostDraft({ ...postDraft, imageUrl: event.target.value })}
                        />
                      </label>
                      <label>
                        이미지 직접 업로드
                        <input type="file" accept="image/*" onChange={(event) => selectPostImage(event, post.id)} />
                      </label>
                      {uploadingPostId === post.id && <p className="form-message">이미지를 업로드하고 있습니다.</p>}
                      {postDraft.imageUrl && (
                        <div className="image-preview">
                          <img src={resolveMediaUrl(postDraft.imageUrl)} alt="첨부 이미지 미리보기" />
                          <button className="secondary-button compact" type="button" onClick={() => setPostDraft({ ...postDraft, imageUrl: "" })}>
                            이미지 제거
                          </button>
                        </div>
                      )}
                      <div className="profile-post-actions">
                        <button className="primary-button compact" type="submit">
                          저장
                        </button>
                        <button className="secondary-button compact" type="button" onClick={() => setEditingPostId("")}>
                          취소
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <Link className="post-title-link" to={`/boards/${post.id}`}>
                        <h3>{post.title}</h3>
                      </Link>
                      <p>{post.content}</p>
                      <div className="post-meta">
                        <span>
                          {displayTimestamp(post)}
                          {isEdited(post) ? " 수정함" : ""}
                        </span>
                      </div>
                      <div className="profile-post-actions">
                        <Link className="secondary-button compact" to={`/boards/${post.id}`}>
                          보기
                        </Link>
                        <button className="primary-button compact" type="button" onClick={() => startPostEdit(post)}>
                          수정
                        </button>
                        <button className="secondary-button compact" type="button" onClick={() => deletePost(post.id)}>
                          삭제
                        </button>
                      </div>
                    </>
                  )}
                </article>
              ))
            ) : (
              <p>작성한 게시글이 없습니다.</p>
            )}
          </div>
        </section>
      )}
    </main>
  );
}

function AdminLoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    setSubmitting(true);

    try {
      const data = await apiRequest("/auth/admin/login", {
        method: "POST",
        body: JSON.stringify(form),
      });
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
      onLogin(data);
      navigate("/admin");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-panel">
        <div className="admin-login-brand">
          <span>
            <ShieldCheck size={28} />
          </span>
          <div>
            <p>Admin Console</p>
            <h1>Dino Cave Control</h1>
          </div>
        </div>
        <form className="admin-login-form" onSubmit={submit}>
          <label>
            관리자 이메일
            <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
          </label>
          <label>
            비밀번호
            <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
          </label>
          {message && <p className="admin-message">{message}</p>}
          <button type="submit" disabled={submitting}>
            <LogIn size={18} />
            {submitting ? "확인 중" : "관리자 로그인"}
          </button>
        </form>
        <Link to="/">일반 페이지로 돌아가기</Link>
      </section>
    </main>
  );
}

function AdminPage({ auth, onLogout }) {
  const [summary, setSummary] = useState(null);
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (auth?.user?.role !== "admin") return;
    Promise.all([apiRequest("/admin/summary"), apiRequest("/admin/posts"), apiRequest("/admin/users"), apiRequest("/admin/comments")])
      .then(([summaryData, postData, userData, commentData]) => {
        setSummary(summaryData.summary);
        setPosts(postData.posts || []);
        setUsers(userData.users || []);
        setComments(commentData.comments || []);
      })
      .catch((error) => setMessage(error.message));
  }, [auth?.user?.role]);

  if (auth?.user?.role !== "admin" || !auth?.token) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <main className="admin-console">
      <aside className="admin-sidebar">
        <Link className="admin-logo" to="/admin">
          <ShieldCheck size={24} />
          <span>Dino Admin</span>
        </Link>
        <nav>
          <a href="#overview">
            <LayoutDashboard size={18} />
            Overview
          </a>
          <a href="#posts">
            <BarChart3 size={18} />
            Posts
          </a>
          <a href="#users">
            <Users size={18} />
            Users
          </a>
        </nav>
        <button className="admin-logout" type="button" onClick={onLogout}>
          <LogOut size={18} />
          로그아웃
        </button>
      </aside>
      <section className="admin-main">
        <div className="admin-topbar">
          <div>
            <p>Signed in as {auth.user.email}</p>
            <h1>관리자 페이지</h1>
          </div>
          <Link to="/" className="admin-link-button">
            일반 사이트
          </Link>
        </div>
        {message && <p className="admin-message">{message}</p>}
        <div className="admin-stat-grid" id="overview">
          <AdminStat label="활성 회원" value={summary?.users ?? "-"} />
          <AdminStat label="전체 게시글" value={summary?.posts ?? "-"} />
          <AdminStat label="노출 게시글" value={summary?.activePosts ?? "-"} />
          <AdminStat label="댓글" value={summary?.comments ?? "-"} />
        </div>

        <section className="admin-table-section" id="posts">
          <div className="admin-section-title">
            <h2>게시물 관리</h2>
            <span>{posts.length} records</span>
          </div>
          <div className="admin-table">
            <div className="admin-row admin-row-head">
              <span>제목</span>
              <span>작성자</span>
              <span>댓글</span>
              <span>상태</span>
            </div>
            {posts.map((post) => (
              <div className="admin-row" key={post.id}>
                <strong>{post.title}</strong>
                <span>{post.authorName}</span>
                <span>{post.commentCount}</span>
                <span className={post.isDeleted ? "status-badge danger" : "status-badge"}>{post.isDeleted ? "삭제됨" : "공개"}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-grid-panel" id="users">
          <div className="admin-table-section">
            <div className="admin-section-title">
              <h2>회원</h2>
              <span>{users.length} users</span>
            </div>
            <div className="admin-compact-list">
              {users.map((user) => (
                <article key={user.id}>
                  <div>
                    <strong>{user.name}</strong>
                    <p>{user.email}</p>
                  </div>
                  <span className={user.role === "admin" ? "status-badge admin" : "status-badge"}>{user.role}</span>
                </article>
              ))}
            </div>
          </div>
          <div className="admin-table-section">
            <div className="admin-section-title">
              <h2>최근 댓글</h2>
              <span>{comments.length} comments</span>
            </div>
            <div className="admin-compact-list">
              {comments.slice(0, 6).map((comment) => (
                <article key={comment.id}>
                  <div>
                    <strong>{comment.authorName}</strong>
                    <p>{comment.content}</p>
                  </div>
                  <span className={comment.isDeleted ? "status-badge danger" : "status-badge"}>{comment.isDeleted ? "삭제됨" : "활성"}</span>
                </article>
              ))}
              {!comments.length && <p className="admin-empty">등록된 댓글이 없습니다.</p>}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

function AdminStat({ label, value }) {
  return (
    <article className="admin-stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [auth, setAuth] = useState(getStoredAuth());
  const isAdminRoute = location.pathname.startsWith("/admin");

  function logout(nextPath) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuth(null);
    navigate(nextPath || (isAdminRoute ? "/admin/login" : "/login"));
  }

  return (
    <>
      {!isAdminRoute && <Header auth={auth} onLogout={logout} />}
      <Routes>
        <Route path="/" element={<HomePage auth={auth} />} />
        <Route path="/boards" element={<BoardPage auth={auth} />} />
        <Route path="/boards/new" element={<PostCreatePage auth={auth} />} />
        <Route path="/boards/:id" element={<BoardDetailPage auth={auth} />} />
        <Route path="/login" element={<LoginPage onLogin={setAuth} />} />
        <Route path="/signup" element={<SignupPage onLogin={setAuth} />} />
        <Route path="/profile" element={<ProfilePage auth={auth} onAuthUpdate={setAuth} onLogout={logout} />} />
        <Route path="/admin/login" element={<AdminLoginPage onLogin={setAuth} />} />
        <Route path="/admin" element={<AdminPage auth={auth} onLogout={logout} />} />
      </Routes>
    </>
  );
}

export default App;

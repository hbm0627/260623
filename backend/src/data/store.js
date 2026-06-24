export const users = [
  {
    id: "admin-1",
    name: "Stone Admin",
    email: process.env.ADMIN_EMAIL || "admin@example.com",
    password: process.env.ADMIN_PASSWORD || "admin1234",
    role: "admin",
    bio: "동굴 기록을 정리하는 관리자입니다.",
    isActive: true,
  },
];

export const posts = [
  {
    id: "post-1",
    title: "첫 번째 동굴 기록",
    content: "석기시대 감성으로 만든 개인 홈페이지의 첫 번째 게시글입니다.",
    authorId: "admin-1",
    viewCount: 0,
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const comments = [];
export const commentReactions = [];

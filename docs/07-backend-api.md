# 백엔드 및 API 설계

## 기술 스택

- Node.js
- Express
- JWT 인증
- bcrypt 비밀번호 암호화
- 데이터베이스: MongoDB 또는 MySQL 중 선택

## 권장 폴더 구조

```text
backend/
  src/
    config/
      database.js
    controllers/
      authController.js
      userController.js
      postController.js
      commentController.js
      reactionController.js
      adminController.js
    middlewares/
      authMiddleware.js
      adminMiddleware.js
      errorMiddleware.js
    models/
      User.js
      Post.js
      Comment.js
      CommentReaction.js
    routes/
      authRoutes.js
      userRoutes.js
      postRoutes.js
      commentRoutes.js
      reactionRoutes.js
      adminRoutes.js
    utils/
      jwt.js
    app.js
    server.js
  .env
  package.json
```

## 인증 API

| Method | Endpoint | 설명 | 권한 |
| --- | --- | --- | --- |
| POST | `/api/auth/signup` | 회원가입 | 비회원 |
| POST | `/api/auth/login` | 일반 로그인 | 비회원 |
| POST | `/api/auth/admin/login` | 관리자 로그인 | 어드민 계정 |
| POST | `/api/auth/logout` | 로그아웃 | 로그인 사용자 |
| GET | `/api/auth/me` | 현재 로그인 사용자 조회 | 로그인 사용자 |

## 사용자 API

| Method | Endpoint | 설명 | 권한 |
| --- | --- | --- | --- |
| GET | `/api/users/me` | 내 프로필 조회 | 로그인 사용자 |
| PATCH | `/api/users/me` | 내 프로필 수정 | 로그인 사용자 |
| GET | `/api/users/me/posts` | 내가 작성한 게시글 조회 | 로그인 사용자 |

## 게시판 API

| Method | Endpoint | 설명 | 권한 |
| --- | --- | --- | --- |
| GET | `/api/posts` | 게시글 목록 조회 | 전체 |
| GET | `/api/posts/:id` | 게시글 상세 조회 및 조회수 증가 | 전체 |
| POST | `/api/posts` | 게시글 작성 | 로그인 사용자 |
| PATCH | `/api/posts/:id` | 게시글 수정 | 작성자 본인 |
| DELETE | `/api/posts/:id` | 게시글 삭제 | 작성자 본인 |

## 댓글 API

| Method | Endpoint | 설명 | 권한 |
| --- | --- | --- | --- |
| GET | `/api/posts/:postId/comments` | 게시글 댓글 및 대댓글 목록 조회 | 전체 |
| POST | `/api/posts/:postId/comments` | 댓글 작성 | 로그인 사용자 |
| POST | `/api/comments/:commentId/replies` | 대댓글 작성 | 로그인 사용자 |
| PATCH | `/api/comments/:id` | 댓글 또는 대댓글 수정 | 작성자 본인 |
| DELETE | `/api/comments/:id` | 댓글 또는 대댓글 삭제 | 작성자 본인 |

## 댓글 반응 API

| Method | Endpoint | 설명 | 권한 |
| --- | --- | --- | --- |
| POST | `/api/comments/:id/reactions/like` | 좋아요 추가/변경/취소 | 로그인 사용자 |
| POST | `/api/comments/:id/reactions/dislike` | 싫어요 추가/변경/취소 | 로그인 사용자 |

## 관리자 API

| Method | Endpoint | 설명 | 권한 |
| --- | --- | --- | --- |
| GET | `/api/admin/posts` | 유저가 생성한 전체 게시글 목록 조회 | 관리자 |
| GET | `/api/admin/posts/:id` | 게시글 상세 조회 | 관리자 |
| PATCH | `/api/admin/posts/:id` | 게시글 수정 | 관리자 |
| DELETE | `/api/admin/posts/:id` | 게시글 삭제 | 관리자 |
| GET | `/api/admin/comments` | 전체 댓글 및 대댓글 목록 조회 | 관리자 |
| GET | `/api/admin/posts/:postId/comments` | 특정 게시글의 댓글 및 대댓글 조회 | 관리자 |
| DELETE | `/api/admin/comments/:id` | 댓글 또는 대댓글 삭제 | 관리자 |

## 공통 응답 기준

- 성공 응답은 일관된 JSON 구조를 사용한다.
- 실패 응답은 `message`와 필요한 경우 `fieldErrors`를 포함한다.
- 인증 실패는 `401`, 권한 부족은 `403`, 리소스 없음은 `404`를 사용한다.

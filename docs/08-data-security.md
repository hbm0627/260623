# 데이터 모델 및 보안 정책

## User

| 필드 | 타입 | 설명 | 필수 여부 |
| --- | --- | --- | --- |
| id | string | 사용자 고유 ID | 필수 |
| name | string | 사용자 이름 | 필수 |
| email | string | 로그인 이메일 | 필수 |
| password | string | 암호화된 비밀번호 | 필수 |
| role | string | `user` 또는 `admin` | 필수 |
| bio | string | 자기소개 | 선택 |
| isActive | boolean | 계정 활성 상태 | 필수 |
| createdAt | Date | 가입일 | 필수 |
| updatedAt | Date | 수정일 | 필수 |

## Post

| 필드 | 타입 | 설명 | 필수 여부 |
| --- | --- | --- | --- |
| id | string | 게시글 고유 ID | 필수 |
| title | string | 게시글 제목 | 필수 |
| content | string | 게시글 내용 | 필수 |
| authorId | string | 작성자 ID | 필수 |
| viewCount | number | 조회수 | 필수 |
| isDeleted | boolean | 삭제 여부 | 필수 |
| createdAt | Date | 작성일 | 필수 |
| updatedAt | Date | 수정일 | 필수 |

## Comment

| 필드 | 타입 | 설명 | 필수 여부 |
| --- | --- | --- | --- |
| id | string | 댓글 고유 ID | 필수 |
| postId | string | 댓글이 속한 게시글 ID | 필수 |
| authorId | string | 작성자 ID | 필수 |
| parentId | string 또는 null | 대댓글인 경우 부모 댓글 ID | 선택 |
| content | string | 댓글 또는 대댓글 내용 | 필수 |
| likeCount | number | 좋아요 수 | 필수 |
| dislikeCount | number | 싫어요 수 | 필수 |
| isDeleted | boolean | 삭제 여부 | 필수 |
| createdAt | Date | 작성일 | 필수 |
| updatedAt | Date | 수정일 | 필수 |

## CommentReaction

| 필드 | 타입 | 설명 | 필수 여부 |
| --- | --- | --- | --- |
| id | string | 반응 고유 ID | 필수 |
| commentId | string | 반응 대상 댓글 또는 대댓글 ID | 필수 |
| userId | string | 반응한 사용자 ID | 필수 |
| type | string | `like` 또는 `dislike` | 필수 |
| createdAt | Date | 생성일 | 필수 |
| updatedAt | Date | 수정일 | 필수 |

## 인증 보안

- 비밀번호는 평문 저장을 금지한다.
- 비밀번호는 bcrypt로 해싱한다.
- 로그인 성공 시 JWT Access Token을 발급한다.
- 보호된 API는 Authorization 헤더의 Bearer Token을 검증한다.
- 관리자 API는 JWT 검증 후 `role` 값이 `admin`인지 추가 확인한다.
- 관리자 로그인은 어드민 계정만 성공 처리한다.

## 권한 보안

- 게시글 수정 및 삭제는 작성자 본인만 가능하다.
- 관리자 API를 통한 게시물 수정 및 삭제는 관리자 권한으로 허용한다.
- 댓글과 대댓글 작성은 로그인 사용자만 가능하다.
- 댓글과 대댓글 수정 및 삭제는 작성자 본인만 가능하다.
- 관리자 API를 통한 댓글 및 대댓글 삭제는 관리자 권한으로 허용한다.
- 댓글과 대댓글 좋아요/싫어요는 로그인 사용자만 가능하다.
- 하나의 사용자는 하나의 댓글 또는 대댓글에 하나의 반응만 남길 수 있다.

## 운영 보안

- `.env` 파일로 JWT_SECRET, DB 접속 정보를 관리한다.
- `.env` 파일은 Git에 커밋하지 않는다.
- API 요청값은 서버에서 필수 검증한다.
- 관리자 삭제 기능은 추후 감사 로그를 남길 수 있게 설계한다.

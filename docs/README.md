# 사주 플랫폼 문서 인덱스

이 폴더는 사주 플랫폼 프로젝트의 기획, 기술 스택, 인증, AI, 이미지/미디어, UX/UI 기준 문서를 관리한다.

## 사주 플랫폼 문서

| 문서 | 내용 |
| --- | --- |
| [saju-00-project-overview.md](./saju-00-project-overview.md) | 프로젝트 목적, 기본 개발 방향, 폴더 구조 |
| [saju-01-tech-stack.md](./saju-01-tech-stack.md) | Next.js, Vercel, Node.js, Supabase, OpenAI 환경 기준 |
| [saju-02-auth-supabase.md](./saju-02-auth-supabase.md) | Supabase Auth, 일반 회원가입, 카카오톡 로그인 |
| [saju-03-supabase-storage-media.md](./saju-03-supabase-storage-media.md) | Supabase bucket, 로컬 media 폴더, 이미지 관리 기준 |
| [saju-04-ai-openai.md](./saju-04-ai-openai.md) | OpenAI API 기반 AI 기능 처리 흐름 |
| [saju-05-ux-ui-assets.md](./saju-05-ux-ui-assets.md) | screenshot 참고 이미지, 이미지 생성, 주요 화면 후보 |

## 기존 참고 문서

아래 문서들은 이전 기획 자료이며, 새 사주 플랫폼 구현 시 필요한 내용만 참고한다.

이 폴더는 개인 홈페이지 프로젝트의 기획, 기능, 디자인, 프론트엔드, 백엔드 문서를 기능별로 나눈 문서 모음이다.

## 문서 목록

| 문서 | 내용 |
| --- | --- |
| [00-service-overview.md](./00-service-overview.md) | 서비스 개요, 목표 사용자, 전체 페이지 구성 |
| [01-auth-user-profile.md](./01-auth-user-profile.md) | 회원가입, 로그인, 프로필, 권한 정책 |
| [02-board-posts.md](./02-board-posts.md) | 게시판, 게시글 CRUD, 조회수 |
| [03-comments-reactions.md](./03-comments-reactions.md) | 댓글, 대댓글, 좋아요/싫어요 |
| [04-admin.md](./04-admin.md) | 관리자 로그인, 게시물/댓글/대댓글 관리 |
| [05-design-gamification.md](./05-design-gamification.md) | 귀여운 공룡 캐릭터, 석기시대 콘셉트, 게이미피케이션, 레퍼런스 |
| [06-frontend.md](./06-frontend.md) | Vite React 프론트엔드 구조와 화면 구성 |
| [07-backend-api.md](./07-backend-api.md) | Node.js 백엔드 구조와 API 설계 |
| [08-data-security.md](./08-data-security.md) | 데이터 모델, 인증, 보안 정책 |
| [service-plan.md](./service-plan.md) | 기존 통합 기획서 |

## 핵심 콘셉트

- 귀여운 공룡 캐릭터가 사이트 곳곳에 등장한다.
- 사용자가 공룡을 클릭하면 말풍선으로 대화한다.
- 공룡 캐릭터는 페이지 상태에 따라 걷기, 점프, 고개 돌리기, 인사하기 같은 움직임을 보여준다.
- 전체 분위기는 석기시대, 동굴 벽화, 돌판 UI, 나무 버튼, 화석 장식 같은 재미있는 형태로 만든다.
- 게시판과 관리자 기능은 실제 사용성이 중요하므로 장식은 과하지 않게 적용한다.

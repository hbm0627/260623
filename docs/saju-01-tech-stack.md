# 기술 스택

## 프론트엔드

- Framework: Next.js
- 배포: Vercel
- 목적: 사용자 웹 화면, 인증 화면, 사주 입력/결과 화면, AI 해석 결과 UI 구현

## 백엔드

- Runtime: Node.js
- 목적: 로컬 테스트용 API, OpenAI API 호출 보조, 서버 사이드 검증 로직 구현
- 초기 단계에서는 테스트 중심으로 구성하고, 필요 시 Supabase Edge Functions 또는 별도 Node 서버 배포를 검토한다.

## 데이터베이스 및 플랫폼

- Supabase를 전체 개발의 핵심 백엔드 플랫폼으로 사용한다.
- 인증, 데이터베이스, 이미지 저장소를 Supabase 중심으로 구성한다.

## 배포

- 프론트엔드는 Vercel에 배포한다.
- Supabase 프로젝트는 인증, DB, Storage bucket을 담당한다.
- 백엔드는 초기 로컬 테스트를 우선하고, 배포 필요성이 생기면 별도 배포 방식을 결정한다.

## 환경 변수

실제 key 값은 저장소에 커밋하지 않는다.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
```

## 보안 기준

- `OPENAI_API_KEY`는 프론트엔드에 노출하지 않는다.
- `SUPABASE_SERVICE_ROLE_KEY`는 서버 환경에서만 사용한다.
- 클라이언트에서는 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`만 사용한다.
- `.env` 파일은 Git 관리 대상에서 제외한다.

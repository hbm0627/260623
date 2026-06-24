# 사주 플랫폼 프로젝트 개요

## 프로젝트 목적

사주 기반 상담/해석 플랫폼을 구축한다. 사용자는 회원가입 또는 소셜 로그인을 통해 서비스를 이용하고, AI 기반 해석 기능과 이미지 중심 UX/UI를 포함한 웹 서비스를 제공한다.

## 기본 개발 방향

- 프론트엔드, 백엔드, 문서, 미디어 리소스를 분리해서 관리한다.
- 로컬 테스트를 먼저 진행한 뒤 배포 환경으로 확장한다.
- 전체 개발의 핵심 인프라는 Supabase를 활용한다.
- AI 기능은 OpenAI API key를 활용해 구현한다.
- 사용자가 제공하는 참고 이미지는 `screenshot` 폴더에 보관하고, UX/UI 제작 시 우선 참고한다.
- 추가 이미지가 필요하면 Codex 내부 이미지 생성 스킬을 활용해 생성한 뒤 `media` 폴더에 정리한다.

## 폴더 구조

```text
frontend/
backend/
docs/
media/
  generated/
  references/
  uploads/
screenshot/
```

## 폴더 역할

| 폴더 | 역할 |
| --- | --- |
| `frontend` | Next.js 기반 프론트엔드 앱 |
| `backend` | Node.js 기반 테스트/서버 로직 |
| `docs` | 프로젝트 기획, 기술 스택, 정책, 구현 기준 문서 |
| `media` | 로컬 테스트용 이미지와 생성 이미지 정리 |
| `media/generated` | AI로 생성한 이미지 보관 |
| `media/references` | 서비스 제작에 참고할 이미지 보관 |
| `media/uploads` | 로컬 테스트용 업로드 샘플 보관 |
| `screenshot` | 사용자가 직접 넣는 UX/UI 참고 스크린샷 |

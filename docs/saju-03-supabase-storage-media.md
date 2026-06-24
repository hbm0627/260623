# 이미지 저장소 및 미디어 관리

## 이미지 저장소

서비스 이미지 저장소는 Supabase Storage bucket을 사용한다.

## Supabase bucket 사용 범위

- 사용자 프로필 이미지
- 사주 콘텐츠 관련 이미지
- AI 생성 이미지 중 서비스에 반영할 이미지
- 관리자 또는 운영자가 업로드하는 서비스 리소스

## 로컬 미디어 폴더

로컬 테스트 단계에서는 루트의 `media` 폴더를 사용한다.

```text
media/
  generated/
  references/
  uploads/
```

## 폴더별 기준

| 폴더 | 내용 |
| --- | --- |
| `media/generated` | Codex 이미지 생성 스킬로 만든 이미지 |
| `media/references` | 디자인/무드/레이아웃 참고용 이미지 |
| `media/uploads` | 로컬 테스트용 업로드 샘플 |
| `screenshot` | 사용자가 직접 넣는 UX/UI 참고 이미지 |

## 운영 기준

- 참고용 이미지는 원본 출처와 사용 목적을 문서화한다.
- 서비스에 실제 반영할 이미지는 라이선스와 사용 가능 여부를 확인한다.
- AI 생성 이미지는 파일명에 용도와 버전을 포함한다.
- Supabase bucket 업로드 전에는 이미지 용량, 해상도, 포맷을 정리한다.

## 권장 파일명

```text
saju-home-hero-v1.png
saju-result-card-bg-v1.png
saju-profile-default-avatar-v1.png
reference-main-flow-001.png
```

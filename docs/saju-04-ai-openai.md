# AI 기능

## AI 제공 방식

AI 기능은 OpenAI API key를 활용해서 구현한다.

## 주요 사용 범위

- 사주 입력값 기반 해석 생성
- 사용자에게 보여줄 요약 결과 생성
- 상세 풀이 생성
- 결과 카드 또는 공유용 문구 생성
- 서비스 UX에 필요한 안내 문구 보조 생성

## API key 관리

- `OPENAI_API_KEY`는 서버 환경 변수로만 관리한다.
- 브라우저에서 직접 OpenAI API를 호출하지 않는다.
- Next.js API Route 또는 Node.js 백엔드에서 OpenAI API를 호출한다.

## 기본 처리 흐름

1. 사용자가 생년월일, 시간, 성별 등 필요한 정보를 입력한다.
2. 프론트엔드가 서버 API로 분석 요청을 보낸다.
3. 서버가 입력값을 검증한다.
4. 서버가 OpenAI API를 호출한다.
5. 생성된 결과를 Supabase DB에 저장한다.
6. 프론트엔드가 결과 화면에 표시한다.

## 결과 저장 기준

저장 후보 데이터:

- user id
- input data
- generated summary
- generated detail
- model name
- token usage
- created at

## 주의사항

- 개인의 중요한 판단을 AI 결과에만 의존하도록 표현하지 않는다.
- 결과 문구에는 엔터테인먼트/참고용 성격을 명확히 반영한다.
- 같은 입력값에 대해 재생성할 수 있으므로 분석 기록과 생성 버전을 관리한다.

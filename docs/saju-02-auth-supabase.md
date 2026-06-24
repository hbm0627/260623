# 회원가입 및 로그인

## 인증 플랫폼

회원가입과 로그인은 Supabase Auth를 활용한다.

## 지원 로그인 방식

1. 일반 회원가입
2. 카카오톡 소셜 로그인

## 일반 회원가입

일반 회원가입은 Supabase 이메일/비밀번호 인증을 기본으로 한다.

필요 화면:

- 회원가입 화면
- 로그인 화면
- 비밀번호 재설정 화면
- 로그인 후 사용자 프로필/마이페이지 화면

## 카카오톡 소셜 로그인

카카오톡 로그인은 Supabase Auth의 OAuth provider 설정을 활용한다.

필요 작업:

- Kakao Developers 앱 생성
- Redirect URI 등록
- Supabase Auth provider에 Kakao client id/secret 설정
- 로그인 완료 후 서비스 내부 세션 연결 확인

## 사용자 데이터

Supabase Auth의 기본 사용자 정보와 별도 프로필 테이블을 분리해서 관리한다.

예상 프로필 데이터:

- user id
- nickname
- email
- avatar url
- birth data 입력 여부
- created at
- updated at

## 초기 정책

- 로그인하지 않은 사용자는 공개 화면만 접근 가능하다.
- 사주 분석 요청, 분석 기록 저장, 마이페이지는 로그인 후 이용 가능하게 한다.
- Row Level Security 정책을 사용해 사용자는 자신의 데이터만 조회/수정할 수 있게 한다.

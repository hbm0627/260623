# 프론트엔드 구조

## 기술 스택

- Vite
- React
- React Router
- Axios 또는 Fetch API
- CSS Modules, Tailwind CSS, 또는 일반 CSS

## 권장 폴더 구조

```text
frontend/
  src/
    api/
      authApi.js
      userApi.js
      postApi.js
      commentApi.js
      reactionApi.js
      adminApi.js
    assets/
      images/
      logos/
    components/
      Header.jsx
      Footer.jsx
      ProtectedRoute.jsx
      AdminRoute.jsx
      PostForm.jsx
      CommentList.jsx
      CommentForm.jsx
      ReactionButtons.jsx
      DinoCharacter.jsx
      SpeechBubble.jsx
      ConfirmModal.jsx
    pages/
      HomePage.jsx
      SignupPage.jsx
      LoginPage.jsx
      AdminLoginPage.jsx
      ProfilePage.jsx
      BoardListPage.jsx
      BoardDetailPage.jsx
      BoardWritePage.jsx
      BoardEditPage.jsx
      AdminPage.jsx
      AdminPostsPage.jsx
      AdminCommentsPage.jsx
    store/
      authStore.js
    styles/
      global.css
    App.jsx
    main.jsx
```

## 주요 컴포넌트

| 컴포넌트 | 역할 |
| --- | --- |
| `Header` | 로고, 메뉴, 로그인 상태 표시 |
| `ProtectedRoute` | 로그인 사용자 전용 라우트 보호 |
| `AdminRoute` | 관리자 전용 라우트 보호 |
| `DinoCharacter` | 공룡 캐릭터 렌더링과 클릭 이벤트 |
| `SpeechBubble` | 공룡 대사 표시 |
| `PostForm` | 게시글 작성/수정 폼 |
| `CommentList` | 댓글과 대댓글 목록 |
| `CommentForm` | 댓글/대댓글 작성 폼 |
| `ReactionButtons` | 좋아요/싫어요 버튼 |
| `ConfirmModal` | 삭제 확인 모달 |

## 화면별 프론트 요구사항

### 메인 페이지

- 공룡 캐릭터가 등장하는 히어로 섹션
- 개인 소개
- 최신 게시글 일부
- 주요 링크
- 스크롤 반응형 섹션 애니메이션

### 로그인/회원가입

- 모바일에서 입력창과 버튼이 겹치지 않아야 한다.
- 공룡 캐릭터가 로그인/가입 안내 메시지를 표시한다.
- 에러 메시지는 명확하고 짧게 표시한다.

### 게시판

- 목록, 상세, 작성, 수정 화면을 제공한다.
- 작성 버튼은 로그인 사용자에게만 노출한다.
- 수정/삭제 버튼은 작성자 본인에게만 노출한다.

### 댓글/대댓글

- 댓글 작성 후 목록을 갱신한다.
- 대댓글 입력창은 필요할 때 펼친다.
- 좋아요/싫어요 선택 상태를 표시한다.

### 관리자

- 관리자 로그인 화면과 관리자 관리 화면을 분리한다.
- 게시물 관리 탭, 댓글/대댓글 관리 탭을 제공한다.
- 모바일에서는 카드형 목록으로 전환한다.

## 반응형 기준

| 구간 | 기준 |
| --- | --- |
| 모바일 | 360px 이상 |
| 태블릿 | 768px 이상 |
| 데스크톱 | 1024px 이상 |
| 와이드 | 1440px 이상 |

## 인터랙션 기준

- 버튼에는 hover, focus, active 상태를 제공한다.
- 삭제는 확인 모달을 사용한다.
- 로딩 상태를 표시한다.
- 성공/실패 피드백을 표시한다.
- 공룡 캐릭터 클릭 시 말풍선을 표시한다.
- 공룡 애니메이션은 과하지 않게 적용한다.

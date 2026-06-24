import Link from "next/link";
import { UserRound } from "lucide-react";
import { AppCard, AppScaffold } from "../components/AppScaffold";

export default function MyPage() {
  return (
    <AppScaffold title="내 정보" kicker="My Page">
      <AppCard>
        <div className="profile-summary">
          <div><UserRound size={28} /></div>
          <section>
            <h2>로컬 사용자</h2>
            <p>Supabase 프로필 테이블과 연결할 마이페이지입니다.</p>
          </section>
        </div>
        <div className="quick-link-grid">
          <Link href="/history">분석 기록</Link>
          <Link href="/profile/edit">프로필 수정</Link>
          <Link href="/login">로그인</Link>
          <Link href="/signup">회원가입</Link>
        </div>
      </AppCard>
    </AppScaffold>
  );
}

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { AppCard, AppScaffold } from "../../components/AppScaffold";

export default function KakaoAuthPage() {
  return (
    <AppScaffold title="카카오 로그인" kicker="Social OAuth">
      <AppCard className="center-card">
        <MessageCircle size={34} />
        <h2>카카오 OAuth 연결 대기</h2>
        <p>Supabase Kakao provider 설정 후 이 버튼이 실제 소셜 로그인으로 이동합니다.</p>
        <Link className="kakao-button wide" href="/my">카카오로 계속하기</Link>
      </AppCard>
    </AppScaffold>
  );
}

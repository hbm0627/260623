import Link from "next/link";
import { Loader2 } from "lucide-react";
import { AppCard, AppScaffold } from "../../components/AppScaffold";

export default function AnalysisLoadingPage() {
  return (
    <AppScaffold title="분석 중" kicker="AI Reading">
      <AppCard className="center-card">
        <Loader2 className="spin" size={42} />
        <h2>운세 카드를 해석하고 있어요</h2>
        <p>실제 구현에서는 이 단계에서 Node 테스트 API 또는 Supabase Edge Function이 OpenAI API를 호출합니다.</p>
        <Link className="primary-link-button wide" href="/result">결과 화면 미리보기</Link>
      </AppCard>
    </AppScaffold>
  );
}

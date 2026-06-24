import Link from "next/link";
import { Bookmark, Share2 } from "lucide-react";
import { AppCard, AppScaffold } from "../components/AppScaffold";

export default function ResultPage() {
  return (
    <AppScaffold title="분석 결과" kicker="Result">
      <AppCard>
        <div className="result-hero">
          <span>오늘의 핵심</span>
          <h2>목(木)의 기운이 선택을 밀어줍니다.</h2>
          <p>작게 시작하고 빠르게 확인하는 흐름이 좋습니다. 감정적인 답장은 한 번 쉬었다가 보내세요.</p>
        </div>
        <div className="result-grid">
          <article>
            <span>요약</span>
            <p>새로운 제안과 연락에 유리한 날</p>
          </article>
          <article>
            <span>주의</span>
            <p>성급한 약속과 소비는 잠시 보류</p>
          </article>
          <article>
            <span>추천</span>
            <p>오전에 정리, 오후에 실행</p>
          </article>
        </div>
        <div className="button-row">
          <button type="button"><Bookmark size={18} /> 저장</button>
          <button type="button"><Share2 size={18} /> 공유</button>
        </div>
        <Link className="primary-link-button" href="/history">분석 기록 보기</Link>
      </AppCard>
    </AppScaffold>
  );
}

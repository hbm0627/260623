import Link from "next/link";
import { Search } from "lucide-react";
import { AppCard, AppScaffold } from "../components/AppScaffold";

export default function SearchPage() {
  return (
    <AppScaffold title="운세 검색" kicker="Search">
      <AppCard>
        <div className="form-heading">
          <Search size={24} />
          <h2>오늘의 운세를 검색해 보세요.</h2>
          <p>현재는 정통 사주와 타로를 중심으로 검색 결과를 구성합니다.</p>
        </div>
        <form className="stack-form">
          <label>
            검색어
            <input placeholder="예: 연애운, 오늘 선택, 재물 흐름" />
          </label>
        </form>
        <div className="quick-link-grid">
          <Link href="/saju">정통 사주</Link>
          <Link href="/tarot">오늘의 타로</Link>
        </div>
      </AppCard>
    </AppScaffold>
  );
}

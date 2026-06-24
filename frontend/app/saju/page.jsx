"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { AppCard, AppScaffold } from "../components/AppScaffold";

export default function SajuPage() {
  return (
    <AppScaffold title="정통 사주" kicker="Birth Data">
      <AppCard>
        <div className="form-heading">
          <Sparkles size={24} />
          <h2>사주 정보 입력</h2>
          <p>생년월일과 태어난 시간을 기준으로 OpenAI 분석 요청을 보낼 화면입니다.</p>
        </div>
        <form className="stack-form">
          <label>
            이름
            <input placeholder="예: 민지" />
          </label>
          <label>
            생년월일
            <input type="date" />
          </label>
          <label>
            태어난 시간
            <input type="time" />
          </label>
          <label>
            성별
            <select defaultValue="미선택">
              <option>미선택</option>
              <option>여성</option>
              <option>남성</option>
              <option>기타</option>
            </select>
          </label>
          <Link className="primary-link-button" href="/analysis/loading">사주 풀이 시작</Link>
        </form>
      </AppCard>
    </AppScaffold>
  );
}

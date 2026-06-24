"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { LockKeyhole, Sparkles, WalletCards } from "lucide-react";
import { AppCard, AppScaffold } from "../../components/AppScaffold";

function getStoredAuth() {
  try {
    return JSON.parse(localStorage.getItem("saju-auth") || "null");
  } catch {
    localStorage.removeItem("saju-auth");
    return null;
  }
}

function TarotResultContent() {
  const searchParams = useSearchParams();
  const number = searchParams.get("number");
  const topic = searchParams.get("topic") || "오늘의 운세";
  const question = searchParams.get("question") || "";
  const loginReturn = `/tarot/result?${new URLSearchParams({ number: number || "", topic, question }).toString()}`;
  const [auth, setAuth] = useState(null);
  const [reading, setReading] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    setAuth(getStoredAuth());
  }, []);

  async function requestInterpretation() {
    const currentAuth = getStoredAuth();
    setAuth(currentAuth);
    if (!currentAuth?.session?.accessToken) {
      setMessage("로그인한 회원만 타로 해석 결과를 볼 수 있습니다.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("http://localhost:4000/api/tarot/interpret", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentAuth.session.accessToken}`,
        },
        body: JSON.stringify({ number, topic, question }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "해석 생성에 실패했습니다.");
      setReading(data.reading);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppScaffold title="타로 결과" kicker="Member Only">
      <AppCard>
        <div className="result-hero dark-result-hero">
          <span>{topic}</span>
          <h2>선택한 카드 번호 {number || "-"}</h2>
          <p>{question || "질문 없이 오늘의 흐름으로 해석합니다."}</p>
        </div>

        {!auth?.session?.accessToken && (
          <div className="member-lock">
            <LockKeyhole size={26} />
            <h2>해석은 로그인한 회원만 볼 수 있습니다.</h2>
            <p>카드 뽑기와 뒤집기는 가능하지만, ChatGPT 기반 분석 결과는 로그인 후 생성됩니다.</p>
            <Link className="primary-link-button wide" href={`/login?return=${encodeURIComponent(loginReturn)}`}>로그인하고 결과 보기</Link>
          </div>
        )}

        {auth?.session?.accessToken && !paid && !reading && (
          <div className="paywall-panel">
            <WalletCards size={28} />
            <h2>좋습니다. 이제 복채를 내셔야 합니다.</h2>
            <p>회원 확인은 끝났습니다. 이 카드의 ChatGPT 정밀 해석은 유료 콘텐츠입니다.</p>
            <strong>타로 정밀 해석권 1회 · 3,900원</strong>
            <button className="primary-link-button wide" type="button" onClick={() => setPaid(true)}>
              결제 테스트하고 해석 열기
            </button>
          </div>
        )}

        {auth?.session?.accessToken && paid && !reading && (
          <button className="primary-link-button wide" type="button" onClick={requestInterpretation} disabled={loading}>
            <Sparkles size={18} />
            {loading ? "해석 생성 중" : "ChatGPT로 해석 생성"}
          </button>
        )}

        {reading && (
          <section className="reading-detail">
            <p className="section-kicker">{reading.interpretation.provider === "openai" ? "OpenAI" : "Mock"}</p>
            <h2>{reading.card.koName}</h2>
            <p>{reading.interpretation.summary}</p>
            <article>
              <strong>상세 해석</strong>
              <p>{reading.interpretation.detail}</p>
            </article>
            <article>
              <strong>조언</strong>
              <p>{reading.interpretation.advice}</p>
            </article>
            <small>{reading.interpretation.caution}</small>
          </section>
        )}

        {message && <p className="form-error">{message}</p>}
      </AppCard>
    </AppScaffold>
  );
}

export default function TarotResultPage() {
  return (
    <Suspense
      fallback={
        <AppScaffold title="타로 결과" kicker="Member Only">
          <AppCard className="center-card">
            <p>결과를 불러오는 중입니다.</p>
          </AppCard>
        </AppScaffold>
      }
    >
      <TarotResultContent />
    </Suspense>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCw, Shuffle, Sparkles } from "lucide-react";
import { AppCard, AppScaffold } from "../components/AppScaffold";
import { API_BASE_URL } from "../lib/api";

const topics = ["오늘의 운세", "연애", "일/직장", "금전", "선택"];

export default function TarotPage() {
  const router = useRouter();
  const [topic, setTopic] = useState(topics[0]);
  const [question, setQuestion] = useState("");
  const [selectedNumber, setSelectedNumber] = useState("");
  const [drawnCard, setDrawnCard] = useState(null);
  const [flipped, setFlipped] = useState(false);
  const [message, setMessage] = useState("");

  const numbers = useMemo(() => Array.from({ length: 78 }, (_, index) => index + 1), []);

  async function drawCard(number = selectedNumber) {
    setMessage("");
    setFlipped(false);
    try {
      const response = await fetch(`${API_BASE_URL}/tarot/draw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "카드를 뽑을 수 없습니다.");
      setSelectedNumber(String(number));
      setDrawnCard(data.card);
    } catch (error) {
      setMessage(error.message);
    }
  }

  function drawRandomCard() {
    drawCard(Math.floor(Math.random() * 78) + 1);
  }

  function goResult() {
    if (!drawnCard) {
      setMessage("먼저 1부터 78 사이의 숫자로 카드를 뽑아주세요.");
      return;
    }
    const params = new URLSearchParams({
      number: String(drawnCard.id),
      topic,
      question,
    });
    router.push(`/tarot/result?${params.toString()}`);
  }

  return (
    <AppScaffold title="오늘의 타로" kicker="78 Cards">
      <AppCard>
        <div className="form-heading">
          <Sparkles size={24} />
          <h2>운세 항목을 고르고 숫자로 카드를 뽑으세요</h2>
          <p>아래 78장 중 마음이 가는 카드 뒷면을 직접 고르세요. 해석 결과는 로그인한 회원만 볼 수 있습니다.</p>
        </div>

        <div className="topic-tabs">
          {topics.map((item) => (
            <button className={topic === item ? "is-active" : ""} key={item} onClick={() => setTopic(item)} type="button">
              {item}
            </button>
          ))}
        </div>

        <form className="stack-form" onSubmit={(event) => event.preventDefault()}>
          <label>
            질문
            <input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="예: 오늘 내가 조심할 것은?" />
          </label>
          <button type="button" onClick={drawRandomCard}>
            <Shuffle size={18} />
            랜덤으로 한 장 뽑기
          </button>
          <button type="button" onClick={() => drawCard()}>
            <Sparkles size={18} />
            입력한 번호로 뽑기
          </button>
        </form>

        <div className="manual-number-picker">
          <label>
            직접 번호 입력
            <input
              min="1"
              max="78"
              type="number"
              value={selectedNumber}
              onChange={(event) => setSelectedNumber(event.target.value)}
              placeholder="1~78"
            />
          </label>
        </div>

        <div className="tarot-picker-heading">
          <strong>타로카드 78장</strong>
          <span>카드를 눌러 선택</span>
        </div>

        <div className="number-grid" aria-label="타로 카드 번호">
          {numbers.map((number) => (
            <button className={Number(selectedNumber) === number ? "is-selected" : ""} key={number} onClick={() => drawCard(number)} type="button">
              <span>{number}</span>
            </button>
          ))}
        </div>

        {drawnCard && (
          <section className="drawn-card-panel">
            <button className={`tarot-flip-card ${flipped ? "is-flipped" : ""}`} onClick={() => setFlipped((value) => !value)} type="button">
              <span className="tarot-card-face tarot-card-back">
                <Sparkles size={28} />
                <strong>{drawnCard.id}</strong>
              </span>
              <span className="tarot-card-face tarot-card-front">
                <small>{drawnCard.group}</small>
                <strong>{drawnCard.koName}</strong>
                <em>{drawnCard.keyword}</em>
              </span>
            </button>
            <button className="secondary-ritual-button" type="button" onClick={() => setFlipped((value) => !value)}>
              <RotateCw size={17} />
              카드 뒤집기
            </button>
            <button className="primary-link-button wide" type="button" onClick={goResult}>
              해석 결과 보기
            </button>
          </section>
        )}

        {message && <p className="form-error">{message}</p>}
      </AppCard>
    </AppScaffold>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Bookmark,
  CalendarClock,
  ChevronRight,
  Home,
  Loader2,
  LockKeyhole,
  Menu,
  Search,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useMemo, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

const tabs = [
  { id: "all", label: "전체" },
  { id: "saju", label: "사주" },
  { id: "tarot", label: "타로" },
];

const services = [
  {
    id: "daily-saju",
    category: "saju",
    title: "정통 사주",
    subtitle: "하루의 기운과 선택 포인트",
    desc: "생년월일과 태어난 시간을 바탕으로 오늘의 흐름을 간단히 읽습니다.",
    art: "daily",
    badge: "사주",
    icon: CalendarClock,
  },
  {
    id: "daily-tarot",
    category: "tarot",
    title: "오늘의 타로",
    subtitle: "지금 필요한 카드 한 장",
    desc: "가볍게 질문을 정하고 오늘의 선택 방향을 타로 카드로 확인합니다.",
    art: "tarot",
    badge: "타로",
    icon: Sparkles,
  },
];

const generatedPrompts = [
  "hero: dark Korean fortune room with tarot cards, saju chart, candles, gold talismans",
];

function SajuArt({ type, large = false }) {
  return (
    <div className={`saju-art art-${type} ${large ? "is-large" : ""}`} aria-hidden="true">
      <span className="moon" />
      <span className="seal" />
      <span className="chart-ring" />
      <span className="figure" />
      <span className="mystic-table" />
      <span className="tarot-fan">
        <i />
        <i />
        <i />
      </span>
      <span className="saju-wheel">
        <i />
        <i />
        <i />
      </span>
      <span className="candle candle-left" />
      <span className="candle candle-right" />
      <span className="talisman talisman-one" />
      <span className="talisman talisman-two" />
      <span className="glow-line one" />
      <span className="glow-line two" />
    </div>
  );
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedService, setSelectedService] = useState(services[0]);
  const [form, setForm] = useState({ name: "", birthDate: "", birthTime: "", gender: "미선택" });
  const [analysis, setAnalysis] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const filteredServices = useMemo(() => {
    if (activeTab === "all") return services;
    return services.filter((service) => service.category === activeTab);
  }, [activeTab]);

  async function requestAnalysis() {
    setError("");
    setStatus("분석 중");

    try {
      const response = await fetch(`${API_BASE_URL}/analysis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "분석 요청에 실패했습니다.");
      setAnalysis(data.analysis);
      setStatus("완료");
    } catch (requestError) {
      setError(requestError.message);
      setStatus("");
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span>운빛</span>
          <strong>오늘의 사주 앱</strong>
        </div>
        <div className="top-actions">
          <button type="button" aria-label="검색">
            <Search size={20} />
          </button>
          <button type="button" aria-label="메뉴">
            <Menu size={24} />
          </button>
        </div>
      </header>

      <nav className="category-tabs" aria-label="카테고리">
        {tabs.map((tab) => (
          <button key={tab.id} className={activeTab === tab.id ? "is-active" : ""} onClick={() => setActiveTab(tab.id)} type="button">
            {tab.label}
          </button>
        ))}
      </nav>

      <Link className="fortune-search-button" href="/search">
        <Search size={18} />
        오늘의 운세를 검색해 보세요.
      </Link>

      <section className="hero-layout">
        <article className="hero-card">
          <Image
            className="hero-generated-image"
            src="/media/generated/saju-tarot-hero-v1.png"
            alt="촛불과 타로카드, 사주 명반이 있는 어두운 운세 공간"
            fill
            priority
            sizes="(max-width: 760px) 100vw, 720px"
          />
          <SajuArt type="hero" large />
          <div className="hero-overlay">
            <span>TOP 1 · AI 사주</span>
            <h1>오늘운세</h1>
            <p>태어난 순간의 흐름을 귀엽고 선명한 카드로 확인해요</p>
            <small>정통 사주와 타로를 앱처럼 빠르게</small>
          </div>
        </article>

        <aside className="login-panel">
          <div>
            <p className="section-kicker">맞춤 추천</p>
            <h2>로그인하면 내 운세 카드가 쌓입니다.</h2>
            <p>일반 회원가입과 카카오 로그인은 Supabase Auth로 연결할 자리입니다.</p>
          </div>
          <div className="auth-actions">
            <Link href="/signup">일반 회원가입</Link>
            <Link href="/auth/kakao">카카오 로그인</Link>
          </div>
        </aside>
      </section>

      <section className="content-section">
        <div className="section-title">
          <div>
            <p className="section-kicker">{tabs.find((tab) => tab.id === activeTab)?.label}</p>
            <h2>궁금한 운세 골라보세요</h2>
          </div>
          <Link href="/search">
            전체 보기
            <ChevronRight size={18} />
          </Link>
        </div>
        <div className="service-grid">
          {filteredServices.map((service) => {
            const Icon = service.icon;
            return (
              <button
                className={`service-card ${selectedService.id === service.id ? "is-selected" : ""}`}
                key={service.id}
                onClick={() => setSelectedService(service)}
                type="button"
              >
                <div className="service-image">
                  <Image
                    className={`service-reader-image reader-${service.category}`}
                    src="/media/generated/fortune-readers-cards-v1.png"
                    alt=""
                    fill
                    sizes="(max-width: 760px) 46vw, 360px"
                  />
                  <SajuArt type={service.art} />
                  <span>{service.badge}</span>
                </div>
                <strong>
                  <Icon size={17} />
                  {service.title}
                </strong>
                <em>{service.subtitle}</em>
                <p>{service.desc}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="analysis-layout">
        <article className="quick-panel">
          <div>
            <p className="section-kicker">AI 사주 시작</p>
            <h2>{selectedService.title}</h2>
            <p>{selectedService.desc}</p>
          </div>
          <form className="birth-form" onSubmit={(event) => event.preventDefault()}>
            <label>
              이름
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="예: 민지" />
            </label>
            <label>
              생년월일
              <input type="date" value={form.birthDate} onChange={(event) => setForm({ ...form, birthDate: event.target.value })} />
            </label>
            <label>
              태어난 시간
              <input type="time" value={form.birthTime} onChange={(event) => setForm({ ...form, birthTime: event.target.value })} />
            </label>
            <label>
              성별
              <select value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value })}>
                <option>미선택</option>
                <option>여성</option>
                <option>남성</option>
                <option>기타</option>
              </select>
            </label>
            <button type="button" onClick={requestAnalysis} disabled={status === "분석 중"}>
              {status === "분석 중" ? <Loader2 className="spin" size={18} /> : <Sparkles size={18} />}
              {status === "분석 중" ? "분석 중" : "AI 풀이 보기"}
            </button>
          </form>
          {error && <p className="form-error">{error}</p>}
        </article>

        <article className="result-preview">
          <div className="section-title">
            <div>
              <p className="section-kicker">결과 미리보기</p>
              <h2>{analysis ? "생성된 풀이" : "오늘의 핵심 운세"}</h2>
            </div>
            <LockKeyhole size={20} />
          </div>
          {analysis ? (
            <>
              <p className="result-summary">{analysis.summary}</p>
              <div className="result-grid">
                {analysis.highlights.map((item) => (
                  <article key={item.label}>
                    <span>{item.label}</span>
                    <p>{item.value}</p>
                  </article>
                ))}
              </div>
              <p className="disclaimer">{analysis.disclaimer}</p>
            </>
          ) : (
            <div className="empty-result">
              <Sparkles size={24} />
              <p>생년월일을 입력하면 Node 테스트 서버에서 목업 결과를 받아옵니다.</p>
            </div>
          )}
        </article>
      </section>

      <section className="pipeline-section">
        <p className="section-kicker">구현 구조</p>
          <h2>앱 기능 연결 구조</h2>
        <div className="pipeline-grid">
          <article>
            <strong>Auth</strong>
            <p>현재 UI 슬롯 → Supabase 이메일 회원가입, 카카오 OAuth</p>
          </article>
          <article>
            <strong>Storage</strong>
            <p>로컬 이미지 슬롯 → Supabase bucket 프로필/콘텐츠 이미지</p>
          </article>
          <article>
            <strong>AI</strong>
            <p>Node 목업 분석 → OpenAI API 호출 및 결과 DB 저장</p>
          </article>
        </div>
      </section>

      <section className="asset-note">
        <p className="section-kicker">미디어 정리</p>
        <ul>
          <li>받은 스크린샷: media/screenshots</li>
          <li>생성 이미지 보관 예정: media/generated</li>
          {generatedPrompts.map((prompt) => (
            <li key={prompt}>imagegen prompt: {prompt}</li>
          ))}
        </ul>
      </section>

      <footer className="bottom-nav" aria-label="하단 메뉴">
        <Link href="/" className="is-active">
          <Home size={21} />
          홈
        </Link>
        <Link href="/saju">
          <CalendarClock size={21} />
          오늘의 운세
        </Link>
        <Link href="/search">
          <Search size={21} />
          검색
        </Link>
        <Link href="/history">
          <Bookmark size={21} />
          보관함
        </Link>
        <Link href="/my">
          <UserRound size={21} />
          내 정보
        </Link>
      </footer>
    </main>
  );
}

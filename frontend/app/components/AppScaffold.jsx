import Link from "next/link";
import { ArrowLeft, Bookmark, CalendarClock, Home, Search, UserRound } from "lucide-react";

export function AppScaffold({ title, kicker, children, actions }) {
  return (
    <main className="app-shell subpage-shell">
      <header className="subpage-topbar">
        <Link href="/" aria-label="홈으로 돌아가기">
          <ArrowLeft size={22} />
        </Link>
        <div>
          <p>{kicker}</p>
          <h1>{title}</h1>
        </div>
        <div className="subpage-actions">{actions}</div>
      </header>
      {children}
      <BottomNav />
    </main>
  );
}

export function BottomNav() {
  return (
    <footer className="bottom-nav" aria-label="하단 메뉴">
      <Link href="/">
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
  );
}

export function AppCard({ children, className = "" }) {
  return <section className={`app-card ${className}`}>{children}</section>;
}

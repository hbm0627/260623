"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mail, MessageCircle, LockKeyhole } from "lucide-react";
import { AppCard, AppScaffold } from "../components/AppScaffold";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "local@saju.test", password: "" });
  const [message, setMessage] = useState("");

  async function mockLogin() {
    setMessage("");
    try {
      const response = await fetch("http://localhost:4000/api/auth/mock-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, provider: "email" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "로그인에 실패했습니다.");
      localStorage.setItem("saju-auth", JSON.stringify(data));
      const returnTo = new URLSearchParams(window.location.search).get("return") || "/my";
      router.push(returnTo);
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <AppScaffold title="로그인" kicker="Supabase Auth">
      <AppCard>
        <div className="form-heading">
          <LockKeyhole size={24} />
          <h2>내 운세 기록에 다시 접속하기</h2>
          <p>최종 구현에서는 Supabase 이메일 로그인과 카카오 OAuth를 연결합니다.</p>
        </div>
        <form className="stack-form">
          <label>
            이메일
            <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" />
          </label>
          <label>
            비밀번호
            <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="로컬 테스트는 비워도 됩니다" />
          </label>
          <button type="button" onClick={mockLogin}>
            <Mail size={18} />
            로컬 테스트 로그인
          </button>
          {message && <p className="form-error">{message}</p>}
          <Link className="kakao-button" href="/auth/kakao">
            <MessageCircle size={18} />
            카카오 로그인
          </Link>
        </form>
        <div className="text-links">
          <Link href="/signup">회원가입</Link>
          <Link href="/reset-password">비밀번호 재설정</Link>
        </div>
      </AppCard>
    </AppScaffold>
  );
}

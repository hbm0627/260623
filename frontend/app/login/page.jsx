"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mail, MessageCircle, LockKeyhole } from "lucide-react";
import { AppCard, AppScaffold } from "../components/AppScaffold";
import { isSupabaseConfigured, supabase } from "../../lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function loginWithEmail(event) {
    event.preventDefault();
    setMessage("");
    if (!isSupabaseConfigured()) {
      setMessage("Supabase 환경변수가 아직 설정되지 않았습니다.");
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
      if (error) throw error;
      const returnTo = new URLSearchParams(window.location.search).get("return") || "/my";
      router.push(returnTo);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AppScaffold title="로그인" kicker="Supabase Auth">
      <AppCard>
        <div className="form-heading">
          <LockKeyhole size={24} />
          <h2>내 운세 기록에 다시 접속하기</h2>
          <p>이메일 계정이나 카카오 OAuth로 로그인합니다.</p>
        </div>
        <form className="stack-form" onSubmit={loginWithEmail}>
          <label>
            이메일
            <input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" />
          </label>
          <label>
            비밀번호
            <input required type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="비밀번호" />
          </label>
          <button type="submit" disabled={isLoading}>
            <Mail size={18} />
            {isLoading ? "로그인 중" : "이메일 로그인"}
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

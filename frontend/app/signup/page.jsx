"use client";

import Link from "next/link";
import { useState } from "react";
import { UserRound, MessageCircle } from "lucide-react";
import { AppCard, AppScaffold } from "../components/AppScaffold";
import { isSupabaseConfigured, supabase } from "../../lib/supabaseClient";

export default function SignupPage() {
  const [form, setForm] = useState({ nickname: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function signUpWithEmail(event) {
    event.preventDefault();
    setMessage("");
    setSuccess("");
    if (!isSupabaseConfigured()) {
      setMessage("Supabase 환경변수가 아직 설정되지 않았습니다.");
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            nickname: form.nickname,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      setSuccess("가입 메일을 확인해 주세요. 이메일 확인 후 로그인할 수 있습니다.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AppScaffold title="회원가입" kicker="일반 회원가입">
      <AppCard>
        <div className="form-heading">
          <UserRound size={24} />
          <h2>운세 기록을 저장할 계정 만들기</h2>
          <p>이메일 가입 후 Supabase 세션으로 로그인합니다.</p>
        </div>
        <form className="stack-form" onSubmit={signUpWithEmail}>
          <label>
            닉네임
            <input required value={form.nickname} onChange={(event) => setForm({ ...form, nickname: event.target.value })} placeholder="예: 운빛러버" />
          </label>
          <label>
            이메일
            <input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" />
          </label>
          <label>
            비밀번호
            <input required minLength={8} type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="8자 이상" />
          </label>
          <button type="submit" disabled={isLoading}>{isLoading ? "가입 처리 중" : "회원가입"}</button>
          {message && <p className="form-error">{message}</p>}
          {success && <p className="form-success">{success}</p>}
          <Link className="kakao-button" href="/auth/kakao">
            <MessageCircle size={18} />
            카카오로 시작하기
          </Link>
        </form>
      </AppCard>
    </AppScaffold>
  );
}

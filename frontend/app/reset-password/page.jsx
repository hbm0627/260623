"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { AppCard, AppScaffold } from "../components/AppScaffold";
import { isSupabaseConfigured, supabase } from "../../lib/supabaseClient";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function sendResetEmail(event) {
    event.preventDefault();
    setMessage("");
    setSuccess("");
    if (!isSupabaseConfigured()) {
      setMessage("Supabase 환경변수가 아직 설정되지 않았습니다.");
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });
      if (error) throw error;
      setSuccess("비밀번호 재설정 메일을 보냈습니다.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AppScaffold title="비밀번호 재설정" kicker="계정 복구">
      <AppCard>
        <div className="form-heading">
          <Mail size={24} />
          <h2>재설정 링크 받기</h2>
          <p>가입한 이메일로 Supabase 재설정 링크를 보냅니다.</p>
        </div>
        <form className="stack-form" onSubmit={sendResetEmail}>
          <label>
            가입 이메일
            <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
          </label>
          <button type="submit" disabled={isLoading}>{isLoading ? "발송 중" : "재설정 메일 보내기"}</button>
          {message && <p className="form-error">{message}</p>}
          {success && <p className="form-success">{success}</p>}
        </form>
      </AppCard>
    </AppScaffold>
  );
}

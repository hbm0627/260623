"use client";

import Link from "next/link";
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { AppCard, AppScaffold } from "../../components/AppScaffold";
import { isSupabaseConfigured, supabase } from "../../../lib/supabaseClient";

export default function KakaoAuthPage() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function loginWithKakao() {
    setMessage("");
    if (!isSupabaseConfigured()) {
      setMessage("Supabase 환경변수가 아직 설정되지 않았습니다.");
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "kakao",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      setMessage(error.message);
      setIsLoading(false);
    }
  }

  return (
    <AppScaffold title="카카오 로그인" kicker="Social OAuth">
      <AppCard className="center-card">
        <MessageCircle size={34} />
        <h2>카카오로 계속하기</h2>
        <p>Supabase Kakao provider 설정이 완료되어 있어야 로그인할 수 있습니다.</p>
        <button className="kakao-button wide auth-provider-button" type="button" onClick={loginWithKakao} disabled={isLoading}>
          {isLoading ? "이동 중" : "카카오로 계속하기"}
        </button>
        {message && <p className="form-error">{message}</p>}
        <Link href="/login">이메일로 로그인</Link>
      </AppCard>
    </AppScaffold>
  );
}

"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { AppCard, AppScaffold } from "../../components/AppScaffold";
import { isSupabaseConfigured, supabase } from "../../../lib/supabaseClient";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("로그인 세션을 확인하고 있습니다.");

  useEffect(() => {
    async function completeAuth() {
      if (!isSupabaseConfigured()) {
        setMessage("Supabase 환경변수가 아직 설정되지 않았습니다.");
        return;
      }

      const code = searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setMessage(error.message);
          return;
        }
      }

      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace("/my");
        return;
      }

      setMessage("세션을 찾지 못했습니다. 다시 로그인해 주세요.");
    }

    completeAuth();
  }, [router, searchParams]);

  return (
    <AppScaffold title="로그인 처리" kicker="Auth Callback">
      <AppCard className="center-card">
        <CheckCircle2 size={34} />
        <h2>인증 처리 중</h2>
        <p>{message}</p>
      </AppCard>
    </AppScaffold>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <AppScaffold title="로그인 처리" kicker="Auth Callback">
          <AppCard className="center-card">
            <CheckCircle2 size={34} />
            <h2>인증 처리 중</h2>
            <p>로그인 세션을 확인하고 있습니다.</p>
          </AppCard>
        </AppScaffold>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}

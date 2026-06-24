"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserRound } from "lucide-react";
import { AppCard, AppScaffold } from "../components/AppScaffold";
import { isSupabaseConfigured, supabase } from "../../lib/supabaseClient";

export default function MyPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setIsLoading(false);
      return;
    }

    supabase.auth.getUser().then(({ data, error }) => {
      if (!error) setUser(data.user);
      setIsLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function signOut() {
    setMessage("");
    const { error } = await supabase.auth.signOut();
    if (error) {
      setMessage(error.message);
      return;
    }
    router.push("/login");
  }

  const displayName = user?.user_metadata?.nickname || user?.user_metadata?.name || user?.email || "로그인이 필요합니다";

  return (
    <AppScaffold title="내 정보" kicker="My Page">
      <AppCard>
        <div className="profile-summary">
          <div><UserRound size={28} /></div>
          <section>
            <h2>{isLoading ? "확인 중" : displayName}</h2>
            <p>{user ? user.email : "Supabase 계정으로 로그인하면 내 정보를 확인할 수 있습니다."}</p>
          </section>
        </div>
        {message && <p className="form-error">{message}</p>}
        <div className="quick-link-grid">
          <Link href="/history">분석 기록</Link>
          <Link href="/profile/edit">프로필 수정</Link>
          {user ? <button type="button" onClick={signOut}>로그아웃</button> : <Link href="/login">로그인</Link>}
          <Link href="/signup">회원가입</Link>
        </div>
      </AppCard>
    </AppScaffold>
  );
}

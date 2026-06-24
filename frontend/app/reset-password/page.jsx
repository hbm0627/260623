import { Mail } from "lucide-react";
import { AppCard, AppScaffold } from "../components/AppScaffold";

export default function ResetPasswordPage() {
  return (
    <AppScaffold title="비밀번호 재설정" kicker="계정 복구">
      <AppCard>
        <div className="form-heading">
          <Mail size={24} />
          <h2>재설정 링크 받기</h2>
          <p>Supabase Auth의 reset password 메일 발송 기능과 연결할 화면입니다.</p>
        </div>
        <form className="stack-form">
          <label>
            가입 이메일
            <input type="email" placeholder="you@example.com" />
          </label>
          <button type="button">재설정 메일 보내기</button>
        </form>
      </AppCard>
    </AppScaffold>
  );
}

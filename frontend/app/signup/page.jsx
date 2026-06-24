import Link from "next/link";
import { UserRound, MessageCircle } from "lucide-react";
import { AppCard, AppScaffold } from "../components/AppScaffold";

export default function SignupPage() {
  return (
    <AppScaffold title="회원가입" kicker="일반 회원가입">
      <AppCard>
        <div className="form-heading">
          <UserRound size={24} />
          <h2>운세 기록을 저장할 계정 만들기</h2>
          <p>이메일 가입 후 프로필과 생년월일 기본값을 연결합니다.</p>
        </div>
        <form className="stack-form">
          <label>
            닉네임
            <input placeholder="예: 운빛러버" />
          </label>
          <label>
            이메일
            <input type="email" placeholder="you@example.com" />
          </label>
          <label>
            비밀번호
            <input type="password" placeholder="8자 이상" />
          </label>
          <button type="button">회원가입</button>
          <Link className="kakao-button" href="/auth/kakao">
            <MessageCircle size={18} />
            카카오로 시작하기
          </Link>
        </form>
      </AppCard>
    </AppScaffold>
  );
}

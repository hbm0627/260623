import { AppCard, AppScaffold } from "../../components/AppScaffold";

export default function ProfileEditPage() {
  return (
    <AppScaffold title="프로필 수정" kicker="Profile">
      <AppCard>
        <form className="stack-form">
          <label>
            닉네임
            <input placeholder="로컬 사용자" />
          </label>
          <label>
            기본 생년월일
            <input type="date" />
          </label>
          <label>
            프로필 이미지
            <input type="file" accept="image/*" />
          </label>
          <button type="button">저장</button>
        </form>
      </AppCard>
    </AppScaffold>
  );
}

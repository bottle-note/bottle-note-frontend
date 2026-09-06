import { GuestLoginPrompt } from '@/components/feature/auth/GuestLoginPrompt';

interface GuestAlcoholDetailPromptProps {
  onLogin: () => void;
}

const TITLE = '지금 보고 계신 위스키, 관심 있으신가요?';
const DESCRIPTION = '보틀노트에 기록하고 나만의 취향 노트를 쌓아보세요!';
const BUTTON_LABEL = '로그인하고 기록 시작하기';

export function GuestAlcoholDetailPrompt({
  onLogin,
}: GuestAlcoholDetailPromptProps) {
  return (
    <div className="flex min-h-safe-screen items-center px-5 pb-[var(--navbar-total-space)]">
      <div className="w-full">
        <GuestLoginPrompt
          title={TITLE}
          description={DESCRIPTION}
          buttonLabel={BUTTON_LABEL}
          onLogin={onLogin}
        />
      </div>
    </div>
  );
}

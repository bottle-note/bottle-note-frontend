import type { ReactNode } from 'react';
import Button from '@/components/ui/Button/Button';

interface GuestCurationLoginPromptProps {
  children: ReactNode;
  onLogin: () => void;
}

export function GuestCurationLoginPrompt({
  children,
  onLogin,
}: GuestCurationLoginPromptProps) {
  return (
    <div className="relative max-h-[390px] overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none select-none space-y-7 blur-[6px]"
      >
        {children}
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-full bg-gradient-to-b from-transparent to-bg-layer-default"
      />
      <div className="absolute inset-x-0 top-1/2 z-20 -translate-y-1/2 px-5">
        <div className="mx-auto w-40">
          <Button btnName="로그인" onClick={onLogin} />
        </div>
      </div>
    </div>
  );
}

'use client';

import Image from 'next/image';
import { X } from 'lucide-react';
import Button from '@/components/ui/Button/Button';

interface AppStorePromptBannerProps {
  onAction: () => void;
  onClose: () => void;
}

function AppStorePromptBanner({
  onAction,
  onClose,
}: AppStorePromptBannerProps) {
  return (
    <aside
      aria-label="BottleNote 앱 안내"
      className="fixed bottom-[calc(var(--navbar-margin-bottom)+var(--navbar-height)+12px)] left-1/2 z-20 flex min-h-64 w-[calc(100%-32px)] max-w-[436px] -translate-x-1/2 items-center gap-8 rounded-xl border border-stroke-neutral-basement bg-bg-layer-floating p-8 pl-12 drop-shadow-[0_7px_22px_rgba(65,49,41,0.13)] animate-in fade-in slide-in-from-bottom-2 duration-300"
    >
      <span className="hidden h-36 w-36 shrink-0 items-center justify-center rounded-lg bg-bg-brand-weak min-[360px]:flex">
        <Image
          src="/icon/logo-subcoral.svg"
          alt=""
          width={12}
          height={20}
          aria-hidden
        />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-13 font-bold text-fg-neutral">
          앱에서 이어서 보세요
        </p>
        <p className="mt-2 hidden truncate text-11 text-fg-neutral-muted min-[360px]:block">
          위스키 기록을 이어서 확인해요
        </p>
      </div>

      <Button
        btnName="앱에서 보기"
        size="md"
        fullWidth={false}
        onClick={onAction}
      />

      <button
        type="button"
        aria-label="앱 안내 닫기"
        className="flex h-32 w-32 shrink-0 items-center justify-center rounded-lg text-fg-neutral-muted active:bg-bg-layer-default-pressed"
        onClick={onClose}
      >
        <X size={16} aria-hidden />
      </button>
    </aside>
  );
}

export default AppStorePromptBanner;

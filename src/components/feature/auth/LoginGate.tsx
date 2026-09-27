'use client';

import type { ReactNode } from 'react';
import Button from '@/components/ui/Button/Button';
import { GuestLoginPrompt } from './GuestLoginPrompt';

type LoginGateProps = {
  // 공통
  onLogin: () => void;
  children?: ReactNode;
  id?: string;
} & (
  | {
      variant: 'blur';
      title: string;
      description: string;
      buttonLabel?: string;
      visibleHeight?: string;
      gradientStartPercent?: number;
    }
  | {
      variant?: 'clear';
      label?: string;
      href?: string;
      disabled?: boolean;
      buttonLabel?: string;
    }
);

export function LoginGate(props: LoginGateProps) {
  const { onLogin, children, id, variant = 'clear' } = props;

  // Clear 방식: 콘텐츠 공개 + 하단 버튼
  if (variant === 'clear') {
    const clearProps = props as Extract<LoginGateProps, { variant?: 'clear' }>;
    const { label, buttonLabel } = clearProps;

    return (
      <>
        {children}
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-stroke-neutral-subtle bg-bg-layer-default px-20 py-16 safe-area-bottom">
          <Button onClick={onLogin}>
            {label || buttonLabel || '로그인하기'}
          </Button>
        </div>
      </>
    );
  }

  // Blur 방식: 콘텐츠 제한 + gradient overlay
  const blurProps = props as Extract<LoginGateProps, { variant: 'blur' }>;
  const {
    title,
    description,
    buttonLabel = '로그인하기',
    visibleHeight = 'min-h-260',
    gradientStartPercent = 42,
  } = blurProps;

  return (
    <section id={id} className={`relative ${visibleHeight} overflow-hidden`}>
      <div aria-hidden="true" className="pointer-events-none select-none">
        {children}
      </div>
      <div
        className="pointer-events-none absolute inset-0 z-10 flex items-end px-20 pb-20"
        style={
          {
            '--gradient-start': `${gradientStartPercent}%`,
            background:
              'linear-gradient(to bottom, transparent 0%, var(--color-bg-layer-default) var(--gradient-start), var(--color-bg-layer-default) 100%)',
          } as React.CSSProperties
        }
      >
        <div className="w-full">
          <GuestLoginPrompt
            title={title}
            description={description}
            buttonLabel={buttonLabel}
            onLogin={onLogin}
          />
        </div>
      </div>
    </section>
  );
}

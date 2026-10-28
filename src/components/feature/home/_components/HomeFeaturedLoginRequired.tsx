'use client';

import React from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button/Button';
import { useLoginGateTracking } from '@/components/feature/auth/useLoginGateTracking';
import { useLoginBridge } from '@/hooks/useLoginBridge';

interface Props {
  isAuthLoading: boolean;
}

export function HomeFeaturedLoginRequired({ isAuthLoading }: Props) {
  const { bridgeToLogin } = useLoginBridge();
  const { ref: gateRef, trackClick } = useLoginGateTracking('home_recent', {
    enabled: !isAuthLoading,
  });

  return (
    <div ref={gateRef} className="flex flex-col">
      <div className="flex flex-col items-center justify-center space-y-14 py-60">
        <Image
          src="/icon/logo-subcoral.svg"
          alt="logo"
          width={28}
          height={48}
          style={{ width: 28, height: 48 }}
          priority
        />
        <p className="text-16 text-fg-neutral-muted">
          로그인 후 확인 가능한 서비스 입니다.
        </p>
        <Button
          size="md"
          variant="secondary"
          className="w-237"
          onClick={() => {
            trackClick();
            bridgeToLogin({ gatePage: 'home_recent' });
          }}
        >
          로그인 하러가기
        </Button>
      </div>
    </div>
  );
}

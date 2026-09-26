'use client';

import React from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button/Button';

interface Props {
  onRetry?: () => void;
}

export function HomeFeaturedErrorState({ onRetry }: Props) {
  return (
    <div className="h-225 flex flex-col items-center justify-center">
      <Image
        src="/icon/logo-subcoral.svg"
        alt="logo"
        width={30}
        height={30}
        style={{ width: 30, height: 30 }}
        priority
      />
      <p className="mt-20 text-15 text-fg-neutral-muted">
        데이터를 불러오는데 실패했습니다.
      </p>
      {onRetry && (
        <Button
          onClick={onRetry}
          size="md"
          variant="secondary"
          className="mt-12"
        >
          다시 시도
        </Button>
      )}
    </div>
  );
}

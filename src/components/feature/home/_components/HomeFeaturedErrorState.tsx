'use client';

import React from 'react';
import Image from 'next/image';

interface Props {
  onRetry?: () => void;
}

export function HomeFeaturedErrorState({ onRetry }: Props) {
  return (
    <div className="h-[225px] flex flex-col items-center justify-center">
      <Image
        src="/icon/logo-subcoral.svg"
        alt="logo"
        width={30}
        height={30}
        style={{ width: 30, height: 30 }}
        priority
      />
      <p className="mt-5 text-15 text-fg-neutral-muted">
        데이터를 불러오는데 실패했습니다.
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 rounded-lg border border-stroke-brand-solid px-4 py-2 text-14 text-fg-brand"
        >
          다시 시도
        </button>
      )}
    </div>
  );
}

'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SubHeader } from '@/components/ui/Navigation/SubHeader';
import NavLayout from '@/components/ui/Layout/NavLayout';
import ErrorFallback from '@/components/ui/Display/ErrorFallback';

export default function PrimaryError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <NavLayout>
      <SubHeader>
        <SubHeader.Left onClick={() => router.back()}>
          <Image
            src="/icon/arrow-left-subcoral.svg"
            alt="arrowIcon"
            width={23}
            height={23}
          />
        </SubHeader.Left>
        <SubHeader.Center>오류</SubHeader.Center>
      </SubHeader>
      <ErrorFallback onBack={() => router.back()} onRetry={reset} />
    </NavLayout>
  );
}

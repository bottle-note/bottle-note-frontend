'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import ErrorFallback from '@/components/ui/Display/ErrorFallback';

export default function CustomError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <div className="h-screen flex justify-center items-center bg-bgGray">
      <ErrorFallback onBack={() => router.back()} onRetry={reset} />
    </div>
  );
}

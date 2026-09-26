import React from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button/Button';

interface Props {
  message?: string;
  onRetry?: () => void;
  onBack?: () => void;
}

function ErrorFallback({
  message = '문제가 발생했어요.\n다시 시도해주세요.',
  onRetry,
  onBack,
}: Props) {
  return (
    <div className="h-[calc(100vh-120px)] flex flex-col justify-center items-center gap-5">
      <Image
        src="/icon/logo-subcoral.svg"
        alt=""
        width={50}
        height={60}
        style={{ width: 50, height: 60 }}
        priority
      />
      <p className="text-fg-neutral-muted whitespace-pre text-center text-15">
        {message}
      </p>
      {(onBack || onRetry) && (
        <div className="flex gap-3 mt-2">
          {onBack && (
            <Button
              type="button"
              onClick={onBack}
              size="md"
              variant="secondary"
            >
              뒤로 가기
            </Button>
          )}
          {onRetry && (
            <Button type="button" onClick={onRetry} size="md">
              다시 시도
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default ErrorFallback;

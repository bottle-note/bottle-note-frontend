import React from 'react';
import Image from 'next/image';

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
      <p className="text-mainGray whitespace-pre text-center text-15">
        {message}
      </p>
      {(onBack || onRetry) && (
        <div className="flex gap-3 mt-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-5 py-2 border border-mainGray text-mainGray rounded-lg text-13"
            >
              뒤로 가기
            </button>
          )}
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="px-5 py-2 bg-mainCoral text-white rounded-lg text-13"
            >
              다시 시도
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default ErrorFallback;

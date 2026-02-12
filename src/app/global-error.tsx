'use client';

import Image from 'next/image';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body>
        <div className="h-screen flex flex-col justify-center items-center gap-5 bg-bgGray">
          <Image
            src="/icon/logo-subcoral.svg"
            alt="bottle_logo"
            width={50}
            height={60}
            style={{ width: 50, height: 60 }}
            priority
          />
          <p className="text-mainGray whitespace-pre text-center text-15">
            {'예상치 못한 오류가 발생했어요.\n다시 시도해주세요.'}
          </p>
          <button
            onClick={reset}
            className="mt-2 px-5 py-2 bg-mainCoral text-white rounded-lg text-13"
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  );
}

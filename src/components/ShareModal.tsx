'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import BackDrop from '@/components/BackDrop';
import { Button } from '@/components/Button';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  title?: string;
}

export default function ShareModal({
  isOpen,
  onClose,
  shareUrl,
  title = '공유하기',
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
    } catch (error) {
      console.error('클립보드 복사 실패:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <BackDrop isShow={isOpen}>
      <div className="w-full h-full flex flex-col justify-center items-center px-4 gap-3">
        <section className="relative w-full min-h-52 pt-16 pb-4 bg-white rounded-xl text-center flex flex-col items-center space-y-4 px-4">
          <article className="absolute top-[-10px]">
            <Image
              src="/icon/logo-subcoral.svg"
              alt="bottle_logo"
              width={40}
              height={55}
              style={{ width: 40, height: 55 }}
              priority
            />
          </article>

          <div className="space-y-2">
            <p className="modal-mainText">{title}</p>
            <p className="modal-subText text-12 text-mainDarkGray">
              이 링크를 복사해서 친구들과 공유해보세요!
            </p>
          </div>

          {/* 링크 표시 영역 */}
          <div className="w-full p-3 bg-sectionWhite rounded-lg border border-mainGray/30">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-12 text-mainDarkGray truncate font-mono">
                  {shareUrl}
                </p>
              </div>
              <button
                onClick={handleCopyToClipboard}
                className="flex-shrink-0 px-2 py-1 text-10 text-subCoral font-medium hover:bg-mainGray/10 rounded-md transition-colors"
              >
                복사
              </button>
            </div>
          </div>

          {/* 복사 완료 메시지 */}
          {copied && (
            <div className="text-12 text-subCoral font-medium">
              링크가 클립보드에 복사되었습니다!
            </div>
          )}

          <div className="w-full space-y-2">
            <Button
              btnName="링크 복사하기"
              onClick={handleCopyToClipboard}
              btnStyles={copied ? 'bg-brightGray' : 'bg-subCoral'}
              btnTextStyles={
                copied
                  ? 'text-mainDarkGray font-bold text-15'
                  : 'text-white font-bold text-15'
              }
            />
            <Button
              btnName="닫기"
              onClick={onClose}
              btnStyles="border border-subCoral bg-white"
              btnTextStyles="text-subCoral font-bold text-15"
            />
          </div>
        </section>
      </div>
    </BackDrop>
  );
}

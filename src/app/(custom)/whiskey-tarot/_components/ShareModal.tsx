'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { TarotCard, WhiskyRecommend } from '../_types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCards: TarotCard[];
  whisky: WhiskyRecommend;
}

export default function ShareModal({
  isOpen,
  onClose,
  selectedCards,
  whisky,
}: ShareModalProps) {
  const shareCardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleWebShare = async () => {
    const shareData = {
      title: '위스키 타로 결과',
      text: `나의 위스키는 "${whisky.nameKo}"! 🥃\n\n${selectedCards.map((c) => c.nameKo).join(' · ')}\n\n나도 타로 보러가기 👇`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          `${shareData.text}\n${shareData.url}`,
        );
        alert('링크가 복사되었습니다!');
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        // eslint-disable-next-line no-console
        console.error('공유 실패:', error);
      }
    }
  };

  const handleCopyLink = async () => {
    const text = `나의 위스키는 "${whisky.nameKo}"! 🥃\n${window.location.href}`;
    try {
      await navigator.clipboard.writeText(text);
      alert('링크가 복사되었습니다!');
    } catch {
      alert('복사에 실패했습니다.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* 오버레이 */}
      <button
        type="button"
        className="absolute inset-0 bg-black/70 cursor-default"
        onClick={onClose}
        aria-label="닫기"
      />

      {/* 모달 콘텐츠 */}
      <div className="relative w-full max-w-[468px] bg-[#1a1a1f] rounded-t-2xl p-6 animate-slide-up">
        {/* 핸들 */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-600 rounded-full" />

        {/* 타이틀 */}
        <h3 className="text-white text-lg font-bold text-center mb-6 mt-2">
          결과 공유하기
        </h3>

        {/* 공유 카드 미리보기 */}
        <div
          ref={shareCardRef}
          className="bg-gradient-to-br from-[#2a1515] to-[#1a0a0a] rounded-xl p-4 mb-6"
        >
          <div className="flex items-center gap-2 mb-3">
            {selectedCards.map((card) => (
              <div
                key={card.id}
                className="relative w-12 h-18 rounded-md overflow-hidden"
              >
                <Image
                  src={card.image}
                  alt={card.nameKo}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
          <p className="text-mainCoral text-sm">나의 위스키</p>
          <p className="text-white text-xl font-bold">{whisky.nameKo}</p>
          <p className="text-white/60 text-sm">{whisky.name}</p>
        </div>

        {/* 공유 버튼들 */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleWebShare}
            className="w-full py-4 bg-gradient-to-r from-mainCoral to-subCoral text-white font-semibold rounded-xl flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            공유하기
          </button>

          <button
            onClick={handleCopyLink}
            className="w-full py-4 bg-white/10 text-white font-medium rounded-xl flex items-center justify-center gap-2 border border-white/20"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            링크 복사
          </button>
        </div>

        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="w-full py-3 text-gray-400 text-sm mt-4"
        >
          닫기
        </button>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { TarotCard, WhiskyRecommend } from '../_types';

interface FinalResultProps {
  selectedCards: TarotCard[];
  whisky: WhiskyRecommend;
  matchReason: string;
  onRetry: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  Fresh: '상큼하고 가벼운',
  Sweet: '달콤하고 부드러운',
  Peat: '스모키하고 깊은',
  Strong: '강렬하고 단단한',
  Balance: '조화로운',
};

export default function FinalResult({
  selectedCards,
  whisky,
  matchReason,
  onRetry,
}: FinalResultProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleGoToWhisky = () => {
    router.push(`/search/${whisky.whiskyCategory}/${whisky.whiskyId}`);
  };

  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden">
      {/* 배경 그라데이션 */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a0a0a] via-[#2a1515] to-[#0a0a0f]" />

      {/* 메인 콘텐츠 */}
      <div
        className={`
          relative z-10 flex-1 flex flex-col px-6 py-8
          transition-all duration-700
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}
      >
        {/* 상단 타이틀 */}
        <div className="text-center mb-6">
          <span className="text-mainCoral text-sm tracking-wider">
            YOUR WHISKEY
          </span>
          <h1 className="text-white text-2xl font-bold mt-2">
            당신의 위스키가 도착했습니다
          </h1>
        </div>

        {/* 선택한 카드들 */}
        <div className="flex justify-center gap-3 mb-6">
          {selectedCards.map((card) => (
            <div key={card.id} className="flex flex-col items-center">
              <div className="relative w-16 h-24 rounded-lg overflow-hidden shadow-lg">
                <Image
                  src={card.image}
                  alt={card.nameKo}
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-white/60 text-xs mt-1">{card.nameKo}</span>
            </div>
          ))}
        </div>

        {/* 위스키 카드 */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-full max-w-[320px] bg-gradient-to-b from-white/10 to-white/5 rounded-2xl p-6 border border-white/10">
            {/* 위스키 이미지 영역 */}
            <div className="w-full aspect-square bg-gradient-to-br from-mainCoral/20 to-subCoral/10 rounded-xl mb-4 flex items-center justify-center">
              <span className="text-8xl">{whisky.emoji}</span>
            </div>

            {/* 위스키 정보 */}
            <div className="text-center">
              <p className="text-mainCoral text-sm mb-1">
                {CATEGORY_LABELS[whisky.category] || whisky.category}
              </p>
              <h2 className="text-white text-xl font-bold mb-1">
                {whisky.nameKo}
              </h2>
              <p className="text-white/60 text-sm mb-4">{whisky.name}</p>

              {/* 매칭 이유 */}
              <div className="bg-white/5 rounded-lg p-4 mb-4">
                <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line">
                  {matchReason}
                </p>
              </div>

              {/* 위스키 설명 */}
              <p className="text-white/60 text-sm leading-relaxed">
                {whisky.description}
              </p>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex flex-col gap-3 mt-6">
          <button
            onClick={handleGoToWhisky}
            className="w-full py-4 bg-gradient-to-r from-mainCoral to-subCoral text-white font-semibold rounded-full shadow-lg shadow-mainCoral/30"
          >
            이 위스키 보러가기
          </button>
          <button
            onClick={onRetry}
            className="w-full py-4 bg-white/10 text-white font-medium rounded-full border border-white/20"
          >
            다시 뽑기
          </button>
        </div>

        {/* 하단 안내 */}
        <p className="text-center text-gray-500 text-xs mt-6">
          Bottle Note | Whiskey Tarot
        </p>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { TarotCard } from '../_types';

interface ResultSlidesProps {
  selectedCards: TarotCard[];
  onComplete: () => void;
}

interface SingleCardSlideProps {
  card: TarotCard;
  cardNumber: number;
  totalCards: number;
  onNext: () => void;
  isLast: boolean;
  isEntering: boolean;
}

const FLAVOR_TAG_LABELS: Record<string, string> = {
  Fresh: '상큼/가벼움',
  Sweet: '달콤/풍요',
  Peat: '스모키/고독',
  Strong: '강렬/바디감',
};

function SingleCardSlide({
  card,
  cardNumber,
  totalCards,
  onNext,
  isLast,
  isEntering,
}: SingleCardSlideProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Entry animation
    if (isEntering) {
      const visibleTimer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(visibleTimer);
    }
  }, [isEntering]);

  useEffect(() => {
    if (!isVisible) return;

    const flipTimer = setTimeout(() => {
      setIsFlipped(true);
    }, 800);

    const contentTimer = setTimeout(() => {
      setShowContent(true);
    }, 1600);

    return () => {
      clearTimeout(flipTimer);
      clearTimeout(contentTimer);
    };
  }, [isVisible]);

  return (
    <div
      className={`
        relative flex flex-col min-h-screen overflow-hidden
        transition-all duration-300 ease-out
        ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}
      `}
      style={{ backgroundColor: card.color || '#0a0a0f' }}
    >
      {/* 배경 그라데이션 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60" />

      {/* 진행 바 */}
      <div className="relative z-20 flex gap-1 px-4 pt-6">
        {Array.from({ length: totalCards }).map((_, index) => (
          <div
            key={index}
            className="flex-1 h-1 rounded-full overflow-hidden bg-white/20"
          >
            <div
              className={`h-full bg-white transition-all duration-500 ${
                index < cardNumber ? 'w-full' : 'w-0'
              }`}
            />
          </div>
        ))}
      </div>

      {/* 카드 번호 */}
      <div className="relative z-10 text-center mt-8">
        <span className="text-white/60 text-sm tracking-wider">
          {cardNumber}번째 카드
        </span>
      </div>

      {/* 메인 콘텐츠 - 스크롤 가능 */}
      <div className="relative z-10 flex-1 flex flex-col items-center px-6 py-4 overflow-y-auto">
        {/* 카드 뒤집기 애니메이션 */}
        <div
          className="relative w-48 h-72 mb-8"
          style={{ perspective: '1000px' }}
        >
          <div
            className={`
              relative w-full h-full transition-transform duration-700
              ${isFlipped ? '[transform:rotateY(180deg)]' : ''}
            `}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* 카드 뒷면 */}
            <div className="absolute inset-0 [backface-visibility:hidden]">
              <div className="w-full h-full rounded-xl bg-[#f4e4c1] p-2 shadow-2xl">
                <div className="relative w-full h-full rounded-lg overflow-hidden border-2 border-[#c9a227]/30">
                  <Image
                    src="/images/tarot/card-back.png"
                    alt="타로 카드"
                    fill
                    sizes="192px"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            {/* 카드 앞면 */}
            <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <div className="w-full h-full rounded-xl bg-[#f4e4c1] p-2 shadow-2xl">
                <div className="relative w-full h-full rounded-lg overflow-hidden border-2 border-[#c9a227]/30">
                  <Image
                    src={card.image}
                    alt={card.nameKo}
                    fill
                    sizes="192px"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 카드 해설 */}
        <div
          className={`
            text-center max-w-[320px] transition-all duration-500
            ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
        >
          {/* 카드 이름 */}
          <h2 className="text-white text-xl font-bold mb-1">{card.nameKo}</h2>
          <p className="text-white/60 text-xs mb-3">{card.name}</p>

          {/* Flavor 태그 */}
          <div className="mb-4">
            <span className="px-4 py-1.5 bg-mainCoral/20 rounded-full text-mainCoral text-sm">
              #{FLAVOR_TAG_LABELS[card.flavorTag] || card.flavorTag}
            </span>
          </div>

          {/* 리딩 텍스트 */}
          <p className="text-white text-sm leading-relaxed whitespace-pre-line">
            {card.readingText}
          </p>

          {/* 구분선 */}
          <div className="w-12 h-px bg-white/20 mx-auto my-4" />

          {/* 카드의 역사 */}
          <div className="text-left">
            <p className="text-white/40 text-xs mb-2">카드의 역사</p>
            <p className="text-white/60 text-xs leading-relaxed">
              {card.history}
            </p>
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div
        className={`
          relative z-10 px-6 pb-safe-lg transition-all duration-500
          ${showContent ? 'opacity-100' : 'opacity-0'}
        `}
      >
        <button
          onClick={onNext}
          disabled={!showContent}
          className="w-full py-4 bg-white/10 text-white font-semibold rounded-full border border-white/20 backdrop-blur-sm disabled:opacity-50"
        >
          {isLast ? '나의 위스키 확인하기' : '다음 카드 보기'}
        </button>
      </div>
    </div>
  );
}

export default function ResultSlides({
  selectedCards,
  onComplete,
}: ResultSlidesProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayIndex, setDisplayIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex >= selectedCards.length - 1) {
      onComplete();
      return;
    }

    // Start transition out
    setIsTransitioning(true);

    // After fade out, change card and fade in
    setTimeout(() => {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setDisplayIndex(nextIndex);
      setIsTransitioning(false);
    }, 300);
  };

  const currentCard = selectedCards[displayIndex];

  if (!currentCard) return null;

  return (
    <SingleCardSlide
      key={`card-${displayIndex}-${currentCard.id}`}
      card={currentCard}
      cardNumber={displayIndex + 1}
      totalCards={selectedCards.length}
      onNext={handleNext}
      isLast={currentIndex >= selectedCards.length - 1}
      isEntering={!isTransitioning}
    />
  );
}

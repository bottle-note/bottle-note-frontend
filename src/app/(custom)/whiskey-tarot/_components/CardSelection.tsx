'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { TarotCard } from '../_types';

interface CardSelectionProps {
  cards: TarotCard[];
  selectedCards: TarotCard[];
  onSelectCard: (card: TarotCard) => void;
  onConfirm: () => void;
  isLoading: boolean;
}

interface CardItemProps {
  index: number;
  selected: boolean;
  disabled: boolean;
  selectedIndex: number;
  onClick: () => void;
  isVisible: boolean;
}

function CardItem({
  index,
  selected,
  disabled,
  selectedIndex,
  onClick,
  isVisible,
}: CardItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || selected || !isVisible}
      className={`
        relative w-20 h-28 sm:w-24 sm:h-36 transition-all duration-500 ease-out
        ${disabled && isVisible ? 'opacity-40 cursor-not-allowed' : ''}
        ${selected ? 'scale-105 z-10 cursor-default' : 'hover:scale-105 active:scale-95'}
      `}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible
          ? selected
            ? 'scale(1.05)'
            : 'scale(1)'
          : 'scale(0.8) translateY(20px)',
        transitionDelay: `${index * 50}ms`,
      }}
    >
      {/* 카드 테두리 (빈티지 타로 스타일) */}
      <div
        className={`
          absolute inset-0 rounded-lg bg-[#f4e4c1] p-1 sm:p-1.5 transition-all duration-300
          ${selected ? 'shadow-lg shadow-mainCoral/40 ring-2 ring-mainCoral' : 'shadow-md hover:shadow-lg'}
        `}
      >
        <div className="relative w-full h-full rounded overflow-hidden border border-[#c9a227]/30">
          <Image
            src="/images/tarot/card-back.png"
            alt="타로 카드"
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>
      </div>

      {/* 선택 표시 */}
      {selected && selectedIndex >= 0 && (
        <div className="absolute -top-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 bg-mainCoral rounded-full flex items-center justify-center shadow-lg z-20 border-2 border-white">
          <span className="text-white text-xs sm:text-sm font-bold">
            {selectedIndex + 1}
          </span>
        </div>
      )}
    </button>
  );
}

export default function CardSelection({
  cards,
  selectedCards,
  onSelectCard,
  onConfirm,
  isLoading,
}: CardSelectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showTitle, setShowTitle] = useState(false);

  // 진입 애니메이션
  useEffect(() => {
    const titleTimer = setTimeout(() => setShowTitle(true), 100);
    const cardsTimer = setTimeout(() => setIsVisible(true), 300);

    return () => {
      clearTimeout(titleTimer);
      clearTimeout(cardsTimer);
    };
  }, []);

  const handleCardClick = (card: TarotCard) => {
    if (selectedCards.some((c) => c.id === card.id)) {
      return;
    }
    if (selectedCards.length >= 3) {
      return;
    }
    onSelectCard(card);
  };

  const isSelected = (cardId: number) =>
    selectedCards.some((c) => c.id === cardId);

  const canSelectMore = selectedCards.length < 3;

  return (
    <div className="relative flex flex-col min-h-screen px-4 py-8">
      {/* 배경 */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#12121a] to-[#0a0a0f]" />

      {/* 헤더 - 중앙에 가깝게 배치 */}
      <div className="relative z-10 flex-1 flex flex-col justify-center">
        <div
          className={`
            text-center mb-8 transition-all duration-500
            ${showTitle ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
          `}
        >
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            마음이 끌리는 카드를 선택하세요
          </h2>
          <p className="text-gray-400 text-sm">
            3장의 카드를 선택해주세요 ({selectedCards.length}/3)
          </p>
        </div>

        {/* 카드 그리드 - 4+3+3 배치 */}
        <div className="flex flex-col items-center gap-3 sm:gap-4 px-2">
          {/* 1줄: 4장 */}
          <div className="flex gap-2 sm:gap-3 justify-center">
            {cards.slice(0, 4).map((card, index) => (
              <CardItem
                key={card.id}
                index={index}
                selected={isSelected(card.id)}
                disabled={!canSelectMore}
                selectedIndex={selectedCards.findIndex((c) => c.id === card.id)}
                onClick={() => handleCardClick(card)}
                isVisible={isVisible}
              />
            ))}
          </div>
          {/* 2줄: 3장 */}
          <div className="flex gap-2 sm:gap-3 justify-center">
            {cards.slice(4, 7).map((card, index) => (
              <CardItem
                key={card.id}
                index={index + 4}
                selected={isSelected(card.id)}
                disabled={!canSelectMore}
                selectedIndex={selectedCards.findIndex((c) => c.id === card.id)}
                onClick={() => handleCardClick(card)}
                isVisible={isVisible}
              />
            ))}
          </div>
          {/* 3줄: 3장 */}
          <div className="flex gap-2 sm:gap-3 justify-center">
            {cards.slice(7, 10).map((card, index) => (
              <CardItem
                key={card.id}
                index={index + 7}
                selected={isSelected(card.id)}
                disabled={!canSelectMore}
                selectedIndex={selectedCards.findIndex((c) => c.id === card.id)}
                onClick={() => handleCardClick(card)}
                isVisible={isVisible}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 선택된 카드 표시 */}
      <div className="relative z-10 mt-6 mb-4">
        <div className="flex justify-center gap-3">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className={`
                relative w-14 h-20 rounded-lg border-2 border-dashed
                overflow-hidden
                transition-all duration-300
                ${
                  selectedCards[index]
                    ? 'border-mainCoral bg-mainCoral/10'
                    : 'border-gray-600'
                }
              `}
            >
              {/* 이미지는 항상 렌더링하고 CSS로 보이기/숨기기 (클릭 시 재다운로드 방지) */}
              <Image
                src="/images/tarot/card-back.png"
                alt="선택된 카드"
                fill
                sizes="56px"
                className={`object-cover transition-opacity duration-300 ${
                  selectedCards[index] ? 'opacity-100' : 'opacity-0'
                }`}
              />
              {!selectedCards[index] && (
                <span className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
                  {index + 1}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 확인 버튼 */}
      <div className="relative z-10 px-4 pb-safe-lg">
        <button
          onClick={onConfirm}
          disabled={selectedCards.length !== 3 || isLoading}
          className={`
            w-full py-4 rounded-full font-semibold transition-all duration-300
            ${
              selectedCards.length === 3
                ? 'bg-gradient-to-r from-mainCoral to-subCoral text-white shadow-lg shadow-mainCoral/30'
                : 'bg-gray-700 text-gray-400'
            }
          `}
        >
          {isLoading ? '로딩 중...' : '결과 보기'}
        </button>
      </div>
    </div>
  );
}

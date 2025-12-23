'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { TarotCard } from '../_types';

interface CardSelectionProps {
  cards: TarotCard[];
  selectedCards: TarotCard[];
  onSelectCard: (card: TarotCard) => void;
  onConfirm: () => void;
  isLoading: boolean;
}

interface ShuffleStepPosition {
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

interface CardItemProps {
  card: TarotCard;
  index: number;
  selected: boolean;
  disabled: boolean;
  selectedIndex: number;
  onClick: () => void;
  shuffleStep: number;
  shufflePosition: ShuffleStepPosition;
}

function CardItem({
  card,
  index,
  selected,
  disabled,
  selectedIndex,
  onClick,
  shuffleStep,
  shufflePosition,
}: CardItemProps) {
  const isShuffling = shuffleStep < 4;

  return (
    <button
      onClick={onClick}
      disabled={disabled || selected || isShuffling}
      className={`
        relative w-20 h-28 sm:w-24 sm:h-36 transition-all duration-400 ease-out
        ${disabled && !isShuffling ? 'opacity-40 cursor-not-allowed' : ''}
        ${selected ? 'scale-105 z-10 cursor-default' : 'hover:scale-105 active:scale-95'}
        ${isShuffling ? 'z-20' : ''}
      `}
      style={{
        transform: `translate(${shufflePosition.x}px, ${shufflePosition.y}px) rotate(${shufflePosition.rotation}deg) scale(${shufflePosition.scale})`,
        opacity: shuffleStep === 0 ? 0 : 1,
        transition: shuffleStep === 0 ? 'none' : 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
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
            className="object-cover"
          />
        </div>
      </div>

      {/* 선택 표시 */}
      {selected && selectedIndex >= 0 && (
        <div className="absolute -top-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 bg-mainCoral rounded-full flex items-center justify-center shadow-lg z-20 border-2 border-white">
          <span className="text-white text-xs sm:text-sm font-bold">{selectedIndex + 1}</span>
        </div>
      )}
    </button>
  );
}

// 그리드 위치 계산 (4+3+3 배치)
const getGridPosition = (index: number) => {
  if (index < 4) return { row: 0, col: index, rowOffset: 0 };
  if (index < 7) return { row: 1, col: index - 4, rowOffset: 0.5 }; // 3장이므로 0.5 오프셋
  return { row: 2, col: index - 7, rowOffset: 0.5 };
};

export default function CardSelection({
  cards,
  selectedCards,
  onSelectCard,
  onConfirm,
  isLoading,
}: CardSelectionProps) {
  const [shuffleStep, setShuffleStep] = useState(0);
  const [showTitle, setShowTitle] = useState(false);

  // 셔플 위치 미리 생성 (step 1~4)
  const shufflePositions = useMemo(() => {
    const cardWidth = 88; // 카드 너비 + gap
    const cardHeight = 124; // 카드 높이 + gap

    return cards.map((_, index) => {
      const gridPos = getGridPosition(index);

      // 중앙 기준점
      const centerCol = 1.5;
      const centerRow = 1;

      // 중앙까지 거리
      const offsetX = (centerCol - gridPos.col - gridPos.rowOffset) * cardWidth;
      const offsetY = (centerRow - gridPos.row) * cardHeight;

      return {
        // Step 1: 중앙에 모임 (카드 덱처럼)
        step1: {
          x: offsetX + (index - 5) * 3,
          y: offsetY + (index - 5) * 2,
          rotation: (Math.random() - 0.5) * 15,
          scale: 0.85,
        },
        // Step 2: 첫 번째 섞기 - 카드들이 흩어지면서 교차
        step2: {
          x: offsetX * 0.4 + (Math.random() - 0.5) * 120,
          y: offsetY * 0.4 + (Math.random() - 0.5) * 80,
          rotation: (Math.random() - 0.5) * 25,
          scale: 0.9,
        },
        // Step 3: 두 번째 섞기 - 반대 방향으로 이동
        step3: {
          x: (Math.random() - 0.5) * 80,
          y: (Math.random() - 0.5) * 50,
          rotation: (Math.random() - 0.5) * 15,
          scale: 0.95,
        },
        // Step 4: 원래 위치로 정착
        step4: {
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
        },
      };
    });
  }, [cards]);

  // 셔플 시퀀스
  useEffect(() => {
    const timers = [
      setTimeout(() => setShowTitle(true), 100),
      setTimeout(() => setShuffleStep(1), 200),  // 중앙에 모임
      setTimeout(() => setShuffleStep(2), 700),  // 첫 번째 섞기
      setTimeout(() => setShuffleStep(3), 1200), // 두 번째 섞기
      setTimeout(() => setShuffleStep(4), 1700), // 원래 위치로
    ];

    return () => timers.forEach(clearTimeout);
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

  // 현재 스텝에 맞는 위치 반환
  const getShufflePosition = (index: number): ShuffleStepPosition => {
    if (shuffleStep === 0) {
      // 초기 상태 (아직 안 보임)
      const gridPos = getGridPosition(index);
      const cardWidth = 88;
      const cardHeight = 124;
      const centerCol = 1.5;
      const centerRow = 1;
      return {
        x: (centerCol - gridPos.col - gridPos.rowOffset) * cardWidth,
        y: (centerRow - gridPos.row) * cardHeight,
        rotation: 0,
        scale: 0.7,
      };
    }
    const stepKey = `step${shuffleStep}` as keyof typeof shufflePositions[number];
    return shufflePositions[index]?.[stepKey] || { x: 0, y: 0, rotation: 0, scale: 1 };
  };

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
                card={card}
                index={index}
                selected={isSelected(card.id)}
                disabled={!canSelectMore}
                selectedIndex={selectedCards.findIndex((c) => c.id === card.id)}
                onClick={() => handleCardClick(card)}
                shuffleStep={shuffleStep}
                shufflePosition={getShufflePosition(index)}
              />
            ))}
          </div>
          {/* 2줄: 3장 */}
          <div className="flex gap-2 sm:gap-3 justify-center">
            {cards.slice(4, 7).map((card, index) => (
              <CardItem
                key={card.id}
                card={card}
                index={index + 4}
                selected={isSelected(card.id)}
                disabled={!canSelectMore}
                selectedIndex={selectedCards.findIndex((c) => c.id === card.id)}
                onClick={() => handleCardClick(card)}
                shuffleStep={shuffleStep}
                shufflePosition={getShufflePosition(index + 4)}
              />
            ))}
          </div>
          {/* 3줄: 3장 */}
          <div className="flex gap-2 sm:gap-3 justify-center">
            {cards.slice(7, 10).map((card, index) => (
              <CardItem
                key={card.id}
                card={card}
                index={index + 7}
                selected={isSelected(card.id)}
                disabled={!canSelectMore}
                selectedIndex={selectedCards.findIndex((c) => c.id === card.id)}
                onClick={() => handleCardClick(card)}
                shuffleStep={shuffleStep}
                shufflePosition={getShufflePosition(index + 7)}
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
                    : 'border-gray-600 flex items-center justify-center'
                }
              `}
            >
              {selectedCards[index] ? (
                <Image
                  src="/images/tarot/card-back.png"
                  alt="선택된 카드"
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="text-gray-500 text-sm">{index + 1}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 확인 버튼 */}
      <div className="relative z-10 px-4">
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

'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useTarotQuiz } from './_hooks/useTarotQuiz';
import IntroScreen from './_components/IntroScreen';
import QuestioningScreen from './_components/QuestioningScreen';
import DealingPhase from './_components/DealingPhase';
import CardSelection from './_components/CardSelection';
import ResultSlides from './_components/ResultSlides';
import FinalResult from './_components/FinalResult';

interface AnimatedPageProps {
  children: ReactNode;
  isActive: boolean;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
}

function AnimatedPage({
  children,
  isActive,
  direction = 'fade',
}: AnimatedPageProps) {
  const [shouldRender, setShouldRender] = useState(isActive);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isActive) {
      setShouldRender(true);
      const timer = setTimeout(() => setIsVisible(true), 20);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setShouldRender(false), 400);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  if (!shouldRender) return null;

  const getTransformClass = () => {
    if (isVisible) return 'translate-x-0 translate-y-0 scale-100';

    switch (direction) {
      case 'up':
        return 'translate-y-8';
      case 'down':
        return '-translate-y-8';
      case 'left':
        return 'translate-x-8';
      case 'right':
        return '-translate-x-8';
      default:
        return 'scale-95';
    }
  };

  return (
    <div
      className={`
        absolute inset-0 transition-all duration-300 ease-out overflow-y-auto
        ${isVisible ? 'opacity-100' : 'opacity-0'}
        ${getTransformClass()}
      `}
    >
      {children}
    </div>
  );
}

export default function WhiskeyTarotPage() {
  const {
    state,
    isLoading,
    goToQuestioning,
    fetchCards,
    goToSelecting,
    toggleCardSelection,
    getRecommendation,
    goToResult,
    reset,
  } = useTarotQuiz();

  const handleStart = () => {
    goToQuestioning();
  };

  const handleQuestioningComplete = () => {
    fetchCards();
  };

  const handleConfirmSelection = () => {
    getRecommendation();
  };

  const handleSlidesComplete = () => {
    goToResult();
  };

  return (
    <div className="relative min-h-screen overflow-hidden pt-safe">
      {/* 인트로 화면 */}
      <AnimatedPage isActive={state.step === 'intro'} direction="fade">
        <IntroScreen onStart={handleStart} />
      </AnimatedPage>

      {/* 질문 생각 화면 */}
      <AnimatedPage isActive={state.step === 'questioning'} direction="fade">
        <QuestioningScreen onReady={handleQuestioningComplete} />
      </AnimatedPage>

      {/* 카드 딜링 화면 (78장 덱에서 10장 뽑기) */}
      <AnimatedPage isActive={state.step === 'dealing'} direction="up">
        <DealingPhase cards={state.cards} onComplete={goToSelecting} />
      </AnimatedPage>

      {/* 카드 선택 화면 */}
      <AnimatedPage isActive={state.step === 'selecting'} direction="up">
        <CardSelection
          cards={state.cards}
          selectedCards={state.selectedCards}
          onSelectCard={toggleCardSelection}
          onConfirm={handleConfirmSelection}
          isLoading={isLoading}
        />
      </AnimatedPage>

      {/* 결과 슬라이드 (Wrapped 스타일) */}
      <AnimatedPage isActive={state.step === 'slides'} direction="left">
        <ResultSlides
          selectedCards={state.selectedCards}
          onComplete={handleSlidesComplete}
        />
      </AnimatedPage>

      {/* 최종 결과 화면 */}
      <AnimatedPage isActive={state.step === 'result'} direction="up">
        {state.recommendedWhisky && (
          <FinalResult
            whisky={state.recommendedWhisky}
            matchReason={state.matchReason}
            selectedCards={state.selectedCards.map((card) => card.nameKo)}
          />
        )}
      </AnimatedPage>
    </div>
  );
}

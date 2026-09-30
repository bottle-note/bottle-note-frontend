'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import LoginModal from '@/components/domain/auth/LoginModal';
import { trackCampaignEvent } from '@/api/campaign-content/campaign-content.api';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
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

const trackWithoutBlocking = (type: 'VIEW' | 'START' | 'FINISH' | 'RESULT') => {
  try {
    trackCampaignEvent('whiskey-tarot', type);
  } catch {
    // Analytics must never block the tarot journey.
  }
};

export default function WhiskeyTarotPage() {
  const { isLoggedIn, isLoading: isAuthLoading } = useAuthSession();
  const [showLogin, setShowLogin] = useState(false);
  const shouldOpenLoginWhenReady = useRef(false);
  const hasTrackedView = useRef(false);
  const hasTrackedStart = useRef(false);
  const hasTrackedFinish = useRef(false);
  const hasTrackedResult = useRef(false);
  const {
    state,
    isLoading,
    prefetchedWhiskyDetail,
    goToQuestioning,
    fetchCards,
    goToSelecting,
    toggleCardSelection,
    getRecommendation,
    goToSlides,
    goToResult,
  } = useTarotQuiz(isLoggedIn);
  const canViewResults = isLoggedIn;

  useEffect(() => {
    if (hasTrackedView.current) return;

    hasTrackedView.current = true;
    trackWithoutBlocking('VIEW');
  }, []);

  useEffect(() => {
    if (state.step !== 'ready' || isAuthLoading) return;

    if (canViewResults) {
      goToSlides();
      return;
    }

    if (shouldOpenLoginWhenReady.current) {
      shouldOpenLoginWhenReady.current = false;
      setShowLogin(true);
    }
  }, [canViewResults, goToSlides, isAuthLoading, state.step]);

  useEffect(() => {
    if (
      !canViewResults ||
      state.step !== 'slides' ||
      hasTrackedResult.current
    ) {
      return;
    }

    hasTrackedResult.current = true;
    trackWithoutBlocking('RESULT');
  }, [canViewResults, state.step]);

  const handleStart = () => {
    if (!hasTrackedStart.current) {
      hasTrackedStart.current = true;
      trackWithoutBlocking('START');
    }
    goToQuestioning();
  };

  const handleQuestioningComplete = () => {
    fetchCards();
  };

  const handleConfirmSelection = () => {
    if (state.step === 'ready') {
      if (!isAuthLoading && !canViewResults) {
        setShowLogin(true);
      }
      return;
    }

    if (state.step !== 'selecting' || state.selectedCards.length !== 3) {
      return;
    }

    if (!hasTrackedFinish.current) {
      hasTrackedFinish.current = true;
      trackWithoutBlocking('FINISH');
    }
    shouldOpenLoginWhenReady.current = !canViewResults;
    getRecommendation();
  };

  const handleSlidesComplete = () => {
    if (canViewResults) {
      goToResult();
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
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

      {/* 추천은 준비되었지만 guest에게는 로그인 전까지 결과를 렌더하지 않는다. */}
      <AnimatedPage isActive={state.step === 'ready'} direction="up">
        <CardSelection
          cards={state.cards}
          selectedCards={state.selectedCards}
          onSelectCard={toggleCardSelection}
          onConfirm={handleConfirmSelection}
          isLoading={isLoading || isAuthLoading}
        />
      </AnimatedPage>

      {/* 결과 슬라이드 (Wrapped 스타일) */}
      <AnimatedPage
        isActive={canViewResults && state.step === 'slides'}
        direction="left"
      >
        {canViewResults && (
          <ResultSlides
            selectedCards={state.selectedCards}
            onComplete={handleSlidesComplete}
          />
        )}
      </AnimatedPage>

      {/* 최종 결과 화면 */}
      <AnimatedPage
        isActive={canViewResults && state.step === 'result'}
        direction="up"
      >
        {canViewResults && state.recommendedWhisky && (
          <FinalResult
            whisky={state.recommendedWhisky}
            matchReason={state.matchReason}
            selectedCards={state.selectedCards.map((card) => card.nameKo)}
            prefetchedWhiskyDetail={prefetchedWhiskyDetail}
          />
        )}
      </AnimatedPage>

      {showLogin && (
        <LoginModal
          handleClose={() => setShowLogin(false)}
          returnTo="/whiskey-tarot"
        />
      )}
    </div>
  );
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
    }

    setIsVisible(false);
    const timer = setTimeout(() => setShouldRender(false), 400);
    return () => clearTimeout(timer);
  }, [isActive]);

  if (!shouldRender) return null;

  const getTransformClass = () => {
    if (isVisible) return 'translate-x-0 translate-y-0 scale-100';

    switch (direction) {
      case 'up':
        return 'translate-y-32';
      case 'down':
        return '-translate-y-32';
      case 'left':
        return 'translate-x-32';
      case 'right':
        return '-translate-x-32';
      default:
        return 'scale-95';
    }
  };

  return (
    <div
      className={`
        absolute inset-0 transition-all duration-300 ease-out overflow-y-auto pt-safe
        ${isVisible ? 'opacity-100' : 'opacity-0'}
        ${getTransformClass()}
      `}
    >
      {children}
    </div>
  );
}

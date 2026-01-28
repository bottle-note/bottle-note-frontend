import { useState, useCallback } from 'react';
import { AlcoholsApi } from '@/api/alcohol/alcohol.api';
import { AlcoholDetailsResponse } from '@/api/alcohol/types';
import { QuizState, QuizStep, TarotCard, WhiskyRecommend } from '../_types';

const initialState: QuizState = {
  step: 'intro',
  cards: [],
  selectedCards: [],
  recommendedWhisky: null,
  matchReason: '',
  currentSlideIndex: 0,
};

export const useTarotQuiz = () => {
  const [state, setState] = useState<QuizState>(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [prefetchedWhiskyDetail, setPrefetchedWhiskyDetail] = useState<
    AlcoholDetailsResponse['alcohols'] | null
  >(null);

  // 질문 생각 화면으로 이동
  const goToQuestioning = useCallback(() => {
    setState((prev) => ({ ...prev, step: 'questioning' }));
  }, []);

  // 카드 목록 불러오기
  const fetchCards = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/whiskey-tarot/cards');
      const data = await response.json();
      setState((prev) => ({
        ...prev,
        cards: data.cards,
        step: 'dealing', // 덱에서 카드 뽑기 화면으로
      }));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('카드 로딩 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // dealing 완료 후 selecting으로 이동
  const goToSelecting = useCallback(() => {
    setState((prev) => ({ ...prev, step: 'selecting' }));
  }, []);

  // 카드 선택/해제
  const toggleCardSelection = useCallback((card: TarotCard) => {
    setState((prev) => {
      const isSelected = prev.selectedCards.some((c) => c.id === card.id);

      if (isSelected) {
        return {
          ...prev,
          selectedCards: prev.selectedCards.filter((c) => c.id !== card.id),
        };
      }

      // 최대 3장까지만 선택 가능
      if (prev.selectedCards.length >= 3) {
        return prev;
      }

      return {
        ...prev,
        selectedCards: [...prev.selectedCards, card],
      };
    });
  }, []);

  // 위스키 추천 받기
  const getRecommendation = useCallback(async () => {
    if (state.selectedCards.length !== 3) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/whiskey-tarot/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedCardIds: state.selectedCards.map((c) => c.id),
        }),
      });

      const data = await response.json();

      // 위스키 상세 정보 프리페치 (이미지 로딩 속도 개선)
      if (data.recommendedWhisky?.whiskyId) {
        AlcoholsApi.getAlcoholDetails(String(data.recommendedWhisky.whiskyId))
          .then((result) => {
            if (result?.data?.alcohols) {
              setPrefetchedWhiskyDetail(result.data.alcohols);
            }
          })
          .catch(() => {
            // 프리페치 실패해도 무시 (FinalResult에서 다시 시도)
          });
      }

      setState((prev) => ({
        ...prev,
        recommendedWhisky: data.recommendedWhisky,
        matchReason: data.matchReason,
        step: 'slides',
        currentSlideIndex: 0,
      }));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('추천 로딩 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, [state.selectedCards]);

  // 스텝 변경
  const setStep = useCallback((step: QuizStep) => {
    setState((prev) => ({ ...prev, step }));
  }, []);

  // 슬라이드 인덱스 변경
  const setSlideIndex = useCallback((index: number) => {
    setState((prev) => ({ ...prev, currentSlideIndex: index }));
  }, []);

  // 다음 슬라이드로 이동
  const nextSlide = useCallback(() => {
    setState((prev) => {
      const maxIndex = prev.selectedCards.length; // 카드 수 + 최종 결과
      if (prev.currentSlideIndex >= maxIndex) {
        return { ...prev, step: 'result' };
      }
      return { ...prev, currentSlideIndex: prev.currentSlideIndex + 1 };
    });
  }, []);

  // 결과 화면으로 이동
  const goToResult = useCallback(() => {
    setState((prev) => ({ ...prev, step: 'result' }));
  }, []);

  // 초기화 (다시하기)
  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  // 선택된 위스키 설정 (직접 설정용)
  const setRecommendedWhisky = useCallback((whisky: WhiskyRecommend) => {
    setState((prev) => ({ ...prev, recommendedWhisky: whisky }));
  }, []);

  return {
    state,
    isLoading,
    prefetchedWhiskyDetail,
    goToQuestioning,
    fetchCards,
    goToSelecting,
    toggleCardSelection,
    getRecommendation,
    setStep,
    setSlideIndex,
    nextSlide,
    goToResult,
    reset,
    setRecommendedWhisky,
  };
};

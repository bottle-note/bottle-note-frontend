import { useCallback, useEffect, useRef, useState } from 'react';
import { AlcoholsApi } from '@/api/alcohol/alcohol.api';
import { AlcoholDetailsResponse } from '@/api/alcohol/types';
import { trackGA4Event } from '@/utils/analytics/ga4';
import {
  FlavorTag,
  QuizState,
  QuizStep,
  RecommendResponse,
  TarotCard,
  WhiskyRecommend,
} from '../_types';

const RESULT_STORAGE_KEY = 'whiskey-tarot:result:v1';
const RESULT_SNAPSHOT_VERSION = 1;
const FLAVOR_TAGS: FlavorTag[] = [
  'Fresh',
  'Sweet',
  'Peat',
  'Strong',
  'Balance',
];

interface TarotResultSnapshot {
  version: typeof RESULT_SNAPSHOT_VERSION;
  selectedCards: TarotCard[];
  recommendation: RecommendResponse;
}

const initialState: QuizState = {
  step: 'intro',
  cards: [],
  selectedCards: [],
  recommendedWhisky: null,
  matchReason: '',
  currentSlideIndex: 0,
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isFlavorTag = (value: unknown): value is FlavorTag =>
  typeof value === 'string' && FLAVOR_TAGS.includes(value as FlavorTag);

const isTarotCard = (value: unknown): value is TarotCard => {
  if (
    !isRecord(value) ||
    !Number.isInteger(value.id) ||
    !isFlavorTag(value.flavorTag)
  ) {
    return false;
  }

  return [
    value.name,
    value.nameKo,
    value.readingText,
    value.history,
    value.image,
    value.color,
  ].every((field) => typeof field === 'string');
};

const hasUniqueCardIds = (cards: TarotCard[]) =>
  cards.length === 3 &&
  new Set(cards.map(({ id }) => id)).size === cards.length;

const isWhiskyRecommend = (value: unknown): value is WhiskyRecommend => {
  if (!isRecord(value) || !isFlavorTag(value.category)) return false;

  return (
    Number.isInteger(value.whiskyId) &&
    [
      value.name,
      value.nameKo,
      value.description,
      value.emoji,
      value.whiskyCategory,
    ].every((field) => typeof field === 'string')
  );
};

const isFlavorScore = (value: unknown): value is Record<FlavorTag, number> =>
  isRecord(value) &&
  FLAVOR_TAGS.every(
    (tag) => typeof value[tag] === 'number' && Number.isFinite(value[tag]),
  );

const isRecommendResponse = (value: unknown): value is RecommendResponse =>
  isRecord(value) &&
  Array.isArray(value.selectedCards) &&
  value.selectedCards.every(isTarotCard) &&
  hasUniqueCardIds(value.selectedCards) &&
  isWhiskyRecommend(value.recommendedWhisky) &&
  typeof value.matchReason === 'string' &&
  isFlavorScore(value.flavorScore);

const hasSameCardIds = (left: TarotCard[], right: TarotCard[]) =>
  left.length === right.length &&
  left.every((card, index) => card.id === right[index]?.id);

const isTarotResultSnapshot = (value: unknown): value is TarotResultSnapshot =>
  isRecord(value) &&
  value.version === RESULT_SNAPSHOT_VERSION &&
  Array.isArray(value.selectedCards) &&
  value.selectedCards.every(isTarotCard) &&
  hasUniqueCardIds(value.selectedCards) &&
  isRecommendResponse(value.recommendation) &&
  hasSameCardIds(value.selectedCards, value.recommendation.selectedCards);

const readResultSnapshot = (): TarotResultSnapshot | null => {
  try {
    const rawSnapshot = window.sessionStorage.getItem(RESULT_STORAGE_KEY);
    if (!rawSnapshot) return null;

    const snapshot: unknown = JSON.parse(rawSnapshot);
    return isTarotResultSnapshot(snapshot) ? snapshot : null;
  } catch {
    return null;
  }
};

const writeResultSnapshot = (
  selectedCards: TarotCard[],
  recommendation: RecommendResponse,
) => {
  try {
    window.sessionStorage.setItem(
      RESULT_STORAGE_KEY,
      JSON.stringify({
        version: RESULT_SNAPSHOT_VERSION,
        selectedCards,
        recommendation,
      } satisfies TarotResultSnapshot),
    );
  } catch {
    // OAuth/login can still continue when browser storage is unavailable.
  }
};

const clearResultSnapshot = () => {
  try {
    window.sessionStorage.removeItem(RESULT_STORAGE_KEY);
  } catch {
    // Storage cleanup must not block restarting the quiz.
  }
};

export const useTarotQuiz = (isLoggedIn: boolean) => {
  const [state, setState] = useState<QuizState>(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [prefetchedWhiskyDetail, setPrefetchedWhiskyDetail] = useState<
    AlcoholDetailsResponse['alcohols'] | null
  >(null);
  const hasRestoredResult = useRef(false);
  const isSubmittingRecommendation = useRef(false);
  const prefetchedWhiskyId = useRef<number | null>(null);

  const prefetchWhiskyDetail = useCallback((whiskyId?: number) => {
    if (!whiskyId) return;

    AlcoholsApi.getAlcoholDetails(String(whiskyId))
      .then((result) => {
        if (result?.data?.alcohols) {
          setPrefetchedWhiskyDetail(result.data.alcohols);
        }
      })
      .catch(() => {
        // FinalResult retries this optional performance prefetch when needed.
      });
  }, []);

  useEffect(() => {
    if (hasRestoredResult.current) return;
    hasRestoredResult.current = true;

    const snapshot = readResultSnapshot();
    if (!snapshot) return;

    const { selectedCards, recommendation } = snapshot;
    setState((previous) => ({
      ...previous,
      cards: selectedCards,
      selectedCards,
      recommendedWhisky: recommendation.recommendedWhisky,
      matchReason: recommendation.matchReason,
      currentSlideIndex: 0,
      step: 'ready',
    }));
  }, []);

  useEffect(() => {
    const whiskyId = state.recommendedWhisky?.whiskyId;
    if (
      !isLoggedIn ||
      (state.step !== 'slides' && state.step !== 'result') ||
      !whiskyId ||
      prefetchedWhiskyId.current === whiskyId
    ) {
      return;
    }

    prefetchedWhiskyId.current = whiskyId;
    prefetchWhiskyDetail(whiskyId);
  }, [isLoggedIn, prefetchWhiskyDetail, state.recommendedWhisky, state.step]);

  // 질문 생각 화면으로 이동
  const goToQuestioning = useCallback(() => {
    trackGA4Event('tarot_start');
    setState((previous) => ({ ...previous, step: 'questioning' }));
  }, []);

  // 카드 목록 불러오기
  const fetchCards = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/whiskey-tarot/cards');
      const data: unknown = await response.json();
      if (
        !isRecord(data) ||
        !Array.isArray(data.cards) ||
        !data.cards.every(isTarotCard)
      ) {
        throw new Error('Invalid tarot card response');
      }

      const tarotCards = data.cards as TarotCard[];
      setState((previous) => ({
        ...previous,
        cards: tarotCards,
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
    setState((previous) => ({ ...previous, step: 'selecting' }));
  }, []);

  // 카드 선택/해제
  const toggleCardSelection = useCallback((card: TarotCard) => {
    setState((previous) => {
      const isSelected = previous.selectedCards.some(
        (selected) => selected.id === card.id,
      );

      if (isSelected) {
        return {
          ...previous,
          selectedCards: previous.selectedCards.filter(
            (selected) => selected.id !== card.id,
          ),
        };
      }

      // 최대 3장까지만 선택 가능
      if (previous.selectedCards.length >= 3) {
        return previous;
      }

      return {
        ...previous,
        selectedCards: [...previous.selectedCards, card],
      };
    });
  }, []);

  // 위스키 추천을 한 번만 랜덤으로 받아 ready 단계에 보관한다.
  const getRecommendation = useCallback(async () => {
    if (
      state.selectedCards.length !== 3 ||
      isSubmittingRecommendation.current
    ) {
      return;
    }

    isSubmittingRecommendation.current = true;
    setIsLoading(true);
    try {
      const response = await fetch('/api/whiskey-tarot/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedCardIds: state.selectedCards.map((card) => card.id),
        }),
      });
      const data: unknown = await response.json();
      if (
        !isRecommendResponse(data) ||
        !hasSameCardIds(state.selectedCards, data.selectedCards)
      ) {
        throw new Error('Invalid tarot recommendation response');
      }

      writeResultSnapshot(state.selectedCards, data);
      setState((previous) => ({
        ...previous,
        recommendedWhisky: data.recommendedWhisky,
        matchReason: data.matchReason,
        step: 'ready',
        currentSlideIndex: 0,
      }));
    } catch (error) {
      isSubmittingRecommendation.current = false;
      // eslint-disable-next-line no-console
      console.error('추천 로딩 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, [state.selectedCards]);

  const goToSlides = useCallback(() => {
    setState((previous) => {
      if (
        previous.selectedCards.length !== 3 ||
        !previous.recommendedWhisky ||
        previous.step !== 'ready'
      ) {
        return previous;
      }

      return { ...previous, step: 'slides', currentSlideIndex: 0 };
    });
  }, []);

  // 스텝 변경
  const setStep = useCallback((step: QuizStep) => {
    setState((previous) => ({ ...previous, step }));
  }, []);

  // 슬라이드 인덱스 변경
  const setSlideIndex = useCallback((index: number) => {
    setState((previous) => ({ ...previous, currentSlideIndex: index }));
  }, []);

  // 다음 슬라이드로 이동
  const nextSlide = useCallback(() => {
    setState((previous) => {
      const maxIndex = previous.selectedCards.length; // 카드 수 + 최종 결과
      if (previous.currentSlideIndex >= maxIndex) {
        return { ...previous, step: 'result' };
      }
      return { ...previous, currentSlideIndex: previous.currentSlideIndex + 1 };
    });
  }, []);

  // 결과 화면으로 이동
  const goToResult = useCallback(() => {
    setState((previous) => {
      if (previous.recommendedWhisky?.whiskyId) {
        trackGA4Event('tarot_complete', {
          result_alcohol_id: String(previous.recommendedWhisky.whiskyId),
        });
      }
      return { ...previous, step: 'result' };
    });
  }, []);

  // 초기화 (다시하기)
  const reset = useCallback(() => {
    isSubmittingRecommendation.current = false;
    prefetchedWhiskyId.current = null;
    clearResultSnapshot();
    setPrefetchedWhiskyDetail(null);
    setState(initialState);
  }, []);

  // 선택된 위스키 설정 (직접 설정용)
  const setRecommendedWhisky = useCallback((whisky: WhiskyRecommend) => {
    setState((previous) => ({ ...previous, recommendedWhisky: whisky }));
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
    goToSlides,
    setStep,
    setSlideIndex,
    nextSlide,
    goToResult,
    reset,
    setRecommendedWhisky,
  };
};

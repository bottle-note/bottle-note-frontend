/* eslint-disable import/no-extraneous-dependencies -- Vitest and RTL are test-only dev dependencies. */
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';

import WhiskeyTarotPage from './page';
import type { RecommendResponse, TarotCard } from './_types';

const { authState, fetchMock, trackCampaignEvent, getAlcoholDetails } =
  vi.hoisted(() => ({
    authState: { isLoggedIn: false, isLoading: false },
    fetchMock: vi.fn(),
    trackCampaignEvent: vi.fn(),
    getAlcoholDetails: vi.fn().mockResolvedValue({}),
  }));

vi.mock('@/hooks/auth/useAuthSession', () => ({
  useAuthSession: () => authState,
}));
vi.mock('@/api/campaign-content/campaign-content.api', () => ({
  trackCampaignEvent,
}));
vi.mock('@/api/alcohol/alcohol.api', () => ({
  AlcoholsApi: { getAlcoholDetails },
}));
vi.mock('@/utils/analytics/ga4', () => ({
  trackGA4Event: vi.fn(),
}));

vi.mock('./_components/IntroScreen', () => ({
  default: ({ onStart }: { onStart: () => void }) => (
    <button onClick={onStart}>intro start</button>
  ),
}));
vi.mock('./_components/QuestioningScreen', () => ({
  default: ({ onReady }: { onReady: () => void }) => (
    <button onClick={onReady}>question ready</button>
  ),
}));
vi.mock('./_components/DealingPhase', () => ({
  default: ({ onComplete }: { onComplete: () => void }) => (
    <button onClick={onComplete}>dealt</button>
  ),
}));
vi.mock('./_components/CardSelection', () => ({
  default: ({
    cards,
    selectedCards,
    onSelectCard,
    onConfirm,
    isLoading,
  }: {
    cards: TarotCard[];
    selectedCards: TarotCard[];
    onSelectCard: (card: TarotCard) => void;
    onConfirm: () => void;
    isLoading: boolean;
  }) => (
    <section data-testid="card-selection">
      {cards.map((card) => (
        <button
          key={card.id}
          disabled={selectedCards.some(({ id }) => id === card.id)}
          onClick={() => onSelectCard(card)}
        >
          choose {card.nameKo}
        </button>
      ))}
      <output>{selectedCards.map(({ nameKo }) => nameKo).join(',')}</output>
      <button
        disabled={selectedCards.length !== 3 || isLoading}
        onClick={onConfirm}
      >
        confirm selection
      </button>
    </section>
  ),
}));
vi.mock('./_components/ResultSlides', () => ({
  default: ({
    selectedCards,
    onComplete,
  }: {
    selectedCards: TarotCard[];
    onComplete: () => void;
  }) => (
    <section data-testid="result-slides">
      <span>{selectedCards.map(({ nameKo }) => nameKo).join(',')}</span>
      <button onClick={onComplete}>complete slides</button>
    </section>
  ),
}));
vi.mock('./_components/FinalResult', () => ({
  default: ({ whisky }: { whisky: { nameKo: string } }) => (
    <section data-testid="final-result">{whisky.nameKo}</section>
  ),
}));
vi.mock('@/components/domain/auth/LoginModal', () => ({
  default: ({
    handleClose,
    returnTo,
  }: {
    handleClose: () => void;
    returnTo?: string;
  }) => (
    <section data-testid="login-modal">
      <span>{returnTo}</span>
      <button onClick={handleClose}>cancel login</button>
    </section>
  ),
}));

const cards: TarotCard[] = [
  {
    id: 11,
    name: 'The Fool',
    nameKo: '바보',
    flavorTag: 'Fresh',
    readingText: '새로운 시작',
    history: '첫 번째 카드',
    image: '/fool.png',
    color: '#111111',
  },
  {
    id: 12,
    name: 'The Magician',
    nameKo: '마법사',
    flavorTag: 'Sweet',
    readingText: '의지',
    history: '두 번째 카드',
    image: '/magician.png',
    color: '#222222',
  },
  {
    id: 13,
    name: 'The High Priestess',
    nameKo: '여사제',
    flavorTag: 'Peat',
    readingText: '직관',
    history: '세 번째 카드',
    image: '/priestess.png',
    color: '#333333',
  },
];

const recommendation: RecommendResponse = {
  selectedCards: cards,
  recommendedWhisky: {
    category: 'Peat',
    name: 'Lagavulin 16',
    nameKo: '라가불린 16',
    description: '스모키한 바다 향',
    emoji: '🥃',
    whiskyCategory: 'Single Malt',
    whiskyId: 16,
  },
  matchReason: '세 장의 카드가 스모키한 여정을 가리켰습니다.',
  flavorScore: {
    Fresh: 1,
    Sweet: 1,
    Peat: 3,
    Strong: 0,
    Balance: 0,
  },
};

const RESULT_STORAGE_KEY = 'whiskey-tarot:result:v1';

async function reachReadyAsGuest() {
  render(<WhiskeyTarotPage />);

  fireEvent.click(screen.getByRole('button', { name: 'intro start' }));
  fireEvent.click(screen.getByRole('button', { name: 'intro start' }));
  fireEvent.click(
    await screen.findByRole('button', { name: 'question ready' }),
  );
  fireEvent.click(await screen.findByRole('button', { name: 'dealt' }));

  for (const card of cards) {
    fireEvent.click(
      await screen.findByRole('button', { name: `choose ${card.nameKo}` }),
    );
  }

  const confirm = screen.getByRole('button', { name: 'confirm selection' });
  await waitFor(() => expect(confirm).toBeEnabled());
  fireEvent.click(confirm);
}

describe('위스키 타로 캠페인 결과 인증 게이트', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    authState.isLoggedIn = false;
    authState.isLoading = false;
    window.sessionStorage.clear();
    vi.stubGlobal('fetch', fetchMock);
    fetchMock
      .mockResolvedValueOnce({ json: async () => ({ cards }) })
      .mockResolvedValueOnce({ json: async () => recommendation });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('mount/start/three-card confirm을 한 번씩 기록하고, 이벤트 실패가 퀴즈를 막지 않는다', async () => {
    trackCampaignEvent.mockImplementation(() => {
      throw new Error('analytics unavailable');
    });

    await reachReadyAsGuest();

    expect(trackCampaignEvent).toHaveBeenCalledWith('whiskey-tarot', 'VIEW');
    expect(trackCampaignEvent).toHaveBeenCalledWith('whiskey-tarot', 'START');
    expect(trackCampaignEvent).toHaveBeenCalledWith('whiskey-tarot', 'FINISH');
    expect(trackCampaignEvent).toHaveBeenCalledTimes(3);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(await screen.findByTestId('login-modal')).toHaveTextContent(
      '/whiskey-tarot',
    );
    expect(getAlcoholDetails).not.toHaveBeenCalled();
  });

  it('guest에게는 lingering transition 중에도 결과를 노출하지 않고, 취소 후 ready 상태를 유지한다', async () => {
    await reachReadyAsGuest();

    expect(await screen.findByTestId('login-modal')).toBeInTheDocument();
    expect(screen.queryByTestId('result-slides')).not.toBeInTheDocument();
    expect(screen.queryByTestId('final-result')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'cancel login' }));

    expect(screen.queryByTestId('login-modal')).not.toBeInTheDocument();
    const cardSelections = screen.getAllByTestId('card-selection');
    expect(cardSelections).toHaveLength(2);
    expect(cardSelections.at(-1)).toHaveTextContent('바보,마법사,여사제');
    expect(screen.queryByTestId('result-slides')).not.toBeInTheDocument();
    expect(
      JSON.parse(window.sessionStorage.getItem(RESULT_STORAGE_KEY) ?? '{}'),
    ).toMatchObject({
      version: 1,
      selectedCards: cards,
      recommendation,
    });
  });

  it('OAuth/약관 왕복 후에는 저장한 랜덤 응답으로 처음 인증된 슬라이드를 복원하고 RESULT는 한 번만 기록한다', async () => {
    window.sessionStorage.setItem(
      RESULT_STORAGE_KEY,
      JSON.stringify({ version: 1, selectedCards: cards, recommendation }),
    );
    authState.isLoggedIn = true;

    const { rerender } = render(<WhiskeyTarotPage />);

    expect(await screen.findByTestId('result-slides')).toHaveTextContent(
      '바보,마법사,여사제',
    );
    expect(fetchMock).not.toHaveBeenCalled();
    expect(trackCampaignEvent).toHaveBeenCalledWith('whiskey-tarot', 'RESULT');
    expect(getAlcoholDetails).toHaveBeenCalledWith('16');
    expect(trackCampaignEvent).toHaveBeenCalledTimes(2);

    rerender(<WhiskeyTarotPage />);
    expect(trackCampaignEvent).toHaveBeenCalledTimes(2);

    authState.isLoggedIn = false;
    rerender(<WhiskeyTarotPage />);
    expect(screen.queryByTestId('result-slides')).not.toBeInTheDocument();
    expect(screen.queryByTestId('final-result')).not.toBeInTheDocument();
  });

  it('손상된 세션 snapshot은 결과로 복원하지 않는다', async () => {
    window.sessionStorage.setItem(
      RESULT_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        selectedCards: [{ ...cards[0], id: 'not-a-card-id' }],
        recommendation,
      }),
    );
    authState.isLoggedIn = true;

    render(<WhiskeyTarotPage />);

    expect(
      await screen.findByRole('button', { name: 'intro start' }),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('result-slides')).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

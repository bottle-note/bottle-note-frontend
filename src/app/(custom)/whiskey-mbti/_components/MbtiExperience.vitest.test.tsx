import { Suspense } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { MBTI_QUESTIONS } from '../_data/questions';
import MbtiExperience from './MbtiExperience';

const { navigation, auth, push, replace, trackCampaignEvent } = vi.hoisted(
  () => ({
    navigation: { search: '' },
    auth: { isLoading: false, isLoggedIn: false },
    push: vi.fn(),
    replace: vi.fn(),
    trackCampaignEvent: vi.fn(),
  }),
);
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace }),
  useSearchParams: () => new URLSearchParams(navigation.search),
  usePathname: () => '/whiskey-mbti',
}));
vi.mock('next/dynamic', async () => {
  const React = await import('react');
  return {
    default: (loader: () => Promise<{ default: React.ComponentType<any> }>) =>
      React.lazy(loader),
  };
});
vi.mock('@/hooks/auth/useAuthSession', () => ({
  useAuthSession: () => auth,
}));
vi.mock('@/api/campaign-content/campaign-content.api', () => ({
  trackCampaignEvent,
}));

const result = {
  code: 'INTJ-A',
  type: 'INTJ',
  taste: 'A',
  tasteLabel: '산뜻한 취향',
  tone: '#fff',
  title: '검증된 결과',
  reason: '결과 설명',
  dramCopy: '위스키 설명',
  characterImage: '/images/whiskey-mbti/characters/INTJ-A.webp',
  whisky: {
    id: null,
    name: '위스키',
    imageUrl: null,
    rating: null,
    ratingCount: null,
    tags: [],
    detailAvailable: false,
  },
};

function renderExperience() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <Suspense fallback={<p>불러오는 중</p>}>
        <MbtiExperience />
      </Suspense>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
  document.getElementById('modal')?.remove();
  document.body.insertAdjacentHTML('beforeend', '<div id="modal"></div>');
  navigation.search = '';
  auth.isLoading = false;
  auth.isLoggedIn = false;
  window.scrollTo = vi.fn();
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (
        url.startsWith('/api/whiskey-mbti/result') &&
        init?.method === 'POST'
      ) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ status: 'complete', code: 'INTJ-A' }),
        });
      }
      return Promise.resolve({ ok: true, json: async () => result });
    }),
  );
});

describe('Whiskey MBTI campaign', () => {
  it('gates direct/shared result URLs for guests without requesting result details', async () => {
    navigation.search = 'result=INTJ-A&shared=1';
    renderExperience();
    expect(
      await screen.findByRole('button', { name: '결과 보기' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('검증된 결과')).not.toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
    expect(trackCampaignEvent).not.toHaveBeenCalledWith(
      'whiskey-mbti',
      'RESULT',
    );
  });

  it('keeps completed answers on modal close and resumes the same result after login', async () => {
    const { unmount } = renderExperience();
    fireEvent.click(screen.getByRole('button', { name: '테스트 시작하기' }));
    await screen.findByText(MBTI_QUESTIONS[0].text);
    for (const question of MBTI_QUESTIONS) {
      expect(screen.getByText(question.text)).toBeInTheDocument();
      const firstAnswer = screen
        .getAllByRole('button')
        .find((button) => button.querySelector('b')?.textContent === 'A');
      expect(firstAnswer).toBeDefined();
      fireEvent.click(firstAnswer!);
    }
    expect(
      await screen.findByText('당신의 위스키 MBTI를 찾았어요.'),
    ).toBeInTheDocument();
    expect(trackCampaignEvent).toHaveBeenCalledWith('whiskey-mbti', 'FINISH');
    fireEvent.click(screen.getByRole('button', { name: '결과 보기' }));
    fireEvent.click(
      await screen.findByRole('button', { name: '다음에 할게요' }),
    );
    expect(
      screen.getByText('당신의 위스키 MBTI를 찾았어요.'),
    ).toBeInTheDocument();
    expect(sessionStorage.getItem('whiskey-mbti-progress')).toContain('INTJ-A');

    fireEvent.click(screen.getByRole('button', { name: '결과 보기' }));
    fireEvent.click(await screen.findByRole('button', { name: '로그인' }));
    expect(push).toHaveBeenCalledWith('/login');
    unmount();
    auth.isLoggedIn = true;
    navigation.search = 'result=INTJ-A';
    renderExperience();
    expect(await screen.findByText('검증된 결과')).toBeInTheDocument();
    await waitFor(() =>
      expect(trackCampaignEvent).toHaveBeenCalledWith('whiskey-mbti', 'RESULT'),
    );
  });

  it('does not show result or fire RESULT while auth is loading', () => {
    navigation.search = 'result=INTJ-A';
    auth.isLoading = true;
    renderExperience();
    expect(screen.queryByText('검증된 결과')).not.toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
    expect(trackCampaignEvent).not.toHaveBeenCalledWith(
      'whiskey-mbti',
      'RESULT',
    );
  });
});

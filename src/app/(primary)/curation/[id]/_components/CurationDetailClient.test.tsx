import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { CurationV2Api } from '@/api/curation-v2/curation-v2.api';
import type { RecommendedWhiskyDetailItem } from '@/api/curation-v2/types';
import CurationDetailClient from './CurationDetailClient';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ back: jest.fn() }),
}));

class ResizeObserverMock {
  observe() {}

  unobserve() {}

  disconnect() {}
}

global.ResizeObserver = ResizeObserverMock;

const curation: RecommendedWhiskyDetailItem = {
  id: 16,
  name: '10만원대 위스키 추천',
  description: '10만원대에서 고를 수 있는 위스키를 소개합니다.',
  coverImageUrl: 'https://example.com/cover.jpg',
  imageUrls: [],
  exposureStartDate: '2026-10-01',
  exposureEndDate: '2026-11-01',
  displayOrder: 1,
  createAt: '2026-10-01',
  spec: {
    id: 1,
    code: 'RECOMMENDED_WHISKY',
    name: '추천 위스키',
    container: 'array',
    responseSpec: {},
  },
  payload: [],
};

describe('CurationDetailClient', () => {
  afterEach(() => jest.restoreAllMocks());

  it('공개 본문을 즉시 보여주고 브라우저에서 최신 상세 정보를 다시 조회한다', async () => {
    const updated = {
      ...curation,
      description: '새로 갱신된 위스키 추천입니다.',
    };
    const getDetail = jest.spyOn(CurationV2Api, 'getDetail').mockResolvedValue({
      success: true,
      code: 200,
      data: updated,
      errors: [],
      meta: {
        serverEncoding: 'UTF-8',
        serverVersion: 'test',
        serverPathVersion: 'v2',
        serverResponseTime: '2026-10-04T00:00:00Z',
      },
    });
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <CurationDetailClient curationId="16" initialData={curation} />
      </QueryClientProvider>,
    );

    expect(
      screen.getByRole('heading', { name: '10만원대 위스키 추천' }),
    ).toBeInTheDocument();
    expect(screen.getByText(curation.description)).toBeInTheDocument();
    expect(await screen.findByText(updated.description)).toBeInTheDocument();
    await waitFor(() => expect(getDetail).toHaveBeenCalledTimes(1));
    expect(getDetail).toHaveBeenCalledWith('16');
  });
});

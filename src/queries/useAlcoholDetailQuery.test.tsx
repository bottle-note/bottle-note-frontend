import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { AlcoholsApi } from '@/api/alcohol/alcohol.api';
import type { AlcoholDetailsResponse } from '@/api/alcohol/types';
import { useAlcoholDetailQuery } from './useAlcoholDetailQuery';

const publicDetail: AlcoholDetailsResponse = {
  alcohols: {
    alcoholId: 482,
    alcoholUrlImg: '/bottle.png',
    description: '위스키 소개',
    korName: '공개 위스키',
    engName: 'Public Whisky',
    korCategory: '싱글 몰트',
    engCategory: 'Single Malt',
    korRegion: '스코틀랜드',
    engRegion: 'Scotland',
    cask: '-',
    abv: '46',
    korDistillery: '-',
    engDistillery: '-',
    rating: 4,
    myAvgRating: 0,
    myRating: 0,
    totalRatingsCount: 12,
    isPicked: false,
    alcoholsTastingTags: null,
  },
  friendsInfo: { followerCount: 0, friends: [] },
  reviewInfo: { reviewList: [] },
};

const personalDetail: AlcoholDetailsResponse = {
  ...publicDetail,
  alcohols: {
    ...publicDetail.alcohols,
    korName: '갱신된 위스키',
    myRating: 4,
    isPicked: true,
  },
};

function response(data: AlcoholDetailsResponse) {
  return {
    success: true,
    code: 200,
    data,
    errors: [],
    meta: {
      serverEncoding: 'UTF-8',
      serverVersion: 'test',
      serverPathVersion: 'v1',
      serverResponseTime: '2026-10-05T00:00:00Z',
    },
  };
}

function Detail({
  enabled,
  viewerId,
  initialData,
}: {
  enabled: boolean;
  viewerId: number | null;
  initialData?: AlcoholDetailsResponse;
}) {
  const { data } = useAlcoholDetailQuery({
    alcoholId: '482',
    viewerId,
    initialData,
    enabled,
  });

  return (
    <p>
      {data
        ? `${data.alcohols.korName} / 찜 ${data.alcohols.isPicked ? '예' : '아니요'}`
        : '위스키 로딩 중'}
    </p>
  );
}

describe('위스키 상세 조회', () => {
  afterEach(() => jest.restoreAllMocks());

  it('공개 데이터를 먼저 보여주고 로그인 복원 후 브라우저에서 한 번 조회한다', async () => {
    const getAlcoholDetails = jest
      .spyOn(AlcoholsApi, 'getAlcoholDetails')
      .mockResolvedValue(response(personalDetail));
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const view = (viewerId: number | null, enabled: boolean) => (
      <QueryClientProvider client={queryClient}>
        <Detail
          viewerId={viewerId}
          enabled={enabled}
          initialData={publicDetail}
        />
      </QueryClientProvider>
    );

    const { rerender } = render(view(null, false));
    expect(screen.getByText('공개 위스키 / 찜 아니요')).toBeInTheDocument();
    expect(getAlcoholDetails).not.toHaveBeenCalled();

    rerender(view(7, true));
    expect(
      await screen.findByText('갱신된 위스키 / 찜 예'),
    ).toBeInTheDocument();
    expect(getAlcoholDetails).toHaveBeenCalledTimes(1);
  });

  it('같은 사용자의 상세 캐시는 재방문에 쓰고 다른 사용자에게는 보여주지 않는다', async () => {
    const getAlcoholDetails = jest
      .spyOn(AlcoholsApi, 'getAlcoholDetails')
      .mockResolvedValue(response(personalDetail));
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const view = (viewerId: number | null, enabled: boolean) => (
      <QueryClientProvider client={queryClient}>
        <Detail viewerId={viewerId} enabled={enabled} />
      </QueryClientProvider>
    );

    const { unmount } = render(view(7, true));
    expect(
      await screen.findByText('갱신된 위스키 / 찜 예'),
    ).toBeInTheDocument();
    unmount();

    const revisit = render(view(7, false));
    expect(screen.getByText('갱신된 위스키 / 찜 예')).toBeInTheDocument();

    revisit.rerender(view(8, false));
    expect(screen.getByText('위스키 로딩 중')).toBeInTheDocument();
    expect(getAlcoholDetails).toHaveBeenCalledTimes(1);
  });
});

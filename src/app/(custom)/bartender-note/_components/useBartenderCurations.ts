import { useMemo, useState } from 'react';
import { CURATION_V2_SPEC_CODES } from '@/api/curation-v2/constants';
import {
  recommendedWhiskyPayloadSchema,
  type CurationAlcohol,
} from '@/api/curation-v2/schema';
import type { CurationV2DetailItem } from '@/api/curation-v2/types';
import { useCurationFeedQuery } from '@/queries/useCurationFeedQuery';
import { useCurationDetailQuery } from '@/queries/useCurationDetailQuery';

/** 한 번에 보여 주는 큐레이션 수. 다음 페이지는 "다른 큐레이션 보기"로 받는다. */
const CURATIONS_PER_PAGE = 3;
/** 제품 큐레이션 탭과 같은 기준: 위스키 추천·페어링 큐레이션. */
const CURATION_CODES = [
  CURATION_V2_SPEC_CODES.RECOMMENDED_WHISKY,
  CURATION_V2_SPEC_CODES.WHISKY_PAIRING,
] as const;

export type CurationsState = 'loading' | 'error' | 'empty' | 'ready';

/** 큐레이션 목록을 3개씩 넘겨 본다. 받은 페이지는 다시 조회하지 않는다. */
export function useCurationChoices({ enabled }: { enabled: boolean }) {
  const [page, setPage] = useState(0);
  const feed = useCurationFeedQuery({
    size: CURATIONS_PER_PAGE,
    code: CURATION_CODES,
    enabled,
  });
  const pages = feed.data ?? [];
  const state: CurationsState =
    pages.length === 0
      ? feed.error
        ? 'error'
        : 'loading'
      : pages[0].data.items.length === 0
        ? 'empty'
        : 'ready';
  const showNext = async () => {
    if (page + 1 >= pages.length) {
      const result = await feed.fetchNextPage();
      if (result.isError) return;
    }
    setPage((current) => current + 1);
  };
  return {
    state,
    items: pages[page]?.data.items ?? [],
    page,
    hasNext: page + 1 < pages.length || Boolean(feed.hasNextPage),
    loadingNext: feed.isFetchingNextPage,
    nextError: pages.length > 0 && Boolean(feed.error),
    showNext: () => void showNext(),
    showFirst: () => setPage(0),
    retry: () => void feed.refetch(),
    reset: () => setPage(0),
  };
}

export type CurationAlcoholItem = CurationAlcohol & {
  alcohol: CurationAlcohol['alcohol'] & { alcoholId: number };
};

export interface BartenderCuration {
  id: number;
  title: string;
  /** 바텐더 노트 안에서 열 수 있는 술만. alcoholId가 없는 항목은 뺀다. */
  alcohols: CurationAlcoholItem[];
}

function toBartenderCuration(detail: CurationV2DetailItem): BartenderCuration {
  const parsed = recommendedWhiskyPayloadSchema.safeParse(detail.payload);
  return {
    id: detail.id,
    title: detail.name,
    alcohols: parsed.success
      ? parsed.data.filter(
          (item): item is CurationAlcoholItem =>
            typeof item.alcohol.alcoholId === 'number',
        )
      : [],
  };
}

/** 고른 큐레이션의 상세. 술 목록과 제목을 함께 준다. */
export function useBartenderCuration(curationId: number | null) {
  const query = useCurationDetailQuery(curationId ?? undefined);
  const curation = useMemo(
    () => (query.data ? toBartenderCuration(query.data) : undefined),
    [query.data],
  );
  return {
    curation,
    isLoading: query.isLoading,
    isError: query.isError,
    retry: () => void query.refetch(),
  };
}

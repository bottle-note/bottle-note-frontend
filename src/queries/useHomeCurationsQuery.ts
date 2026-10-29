import { useQuery } from '@tanstack/react-query';
import { CurationV2Api } from '@/api/curation-v2/curation-v2.api';
import { CURATION_V2_SPEC_CODES } from '@/api/curation-v2/constants';
import type { CurationV2FeedItem } from '@/api/curation-v2/types';
import { curationV2Keys } from '@/queries/curationV2Keys';

const HOME_CURATION_CODES = [
  CURATION_V2_SPEC_CODES.WHISKY_TASTING_EVENT,
  CURATION_V2_SPEC_CODES.RECOMMENDED_WHISKY,
  CURATION_V2_SPEC_CODES.WHISKY_PAIRING,
  CURATION_V2_SPEC_CODES.PROGRAM,
] as const;
const HOME_CURATION_SIZE = 8;

/** 홈 에디터 추천: 큐레이션 피드 첫 페이지만 쓴다. */
export const useHomeCurationsQuery = () =>
  useQuery({
    queryKey: curationV2Keys.feed({
      size: HOME_CURATION_SIZE,
      code: HOME_CURATION_CODES,
    }),
    queryFn: async (): Promise<CurationV2FeedItem[]> => {
      const response = await CurationV2Api.getFeed({
        size: HOME_CURATION_SIZE,
        code: [...HOME_CURATION_CODES],
      });
      return response.data.items;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: false,
  });

import { CurationV2Api } from '@/api/curation-v2/curation-v2.api';
import type { CurationV2SpecCode } from '@/api/curation-v2/constants';
import type { CurationV2FeedData } from '@/api/curation-v2/types';
import { usePaginatedQuery } from '@/queries/usePaginatedQuery';
import { curationV2Keys } from '@/queries/curationV2Keys';

interface UseCurationFeedQueryParams {
  size?: number;
  keyword?: string;
  code: CurationV2SpecCode | readonly CurationV2SpecCode[];
  enabled?: boolean;
}

export const useCurationFeedQuery = ({
  size = 10,
  keyword,
  code,
  enabled = true,
}: UseCurationFeedQueryParams) => {
  const codes = Array.isArray(code) ? [...code] : [code];

  return usePaginatedQuery<CurationV2FeedData>({
    queryKey: [...curationV2Keys.feed({ size, keyword, code: codes })],
    queryFn: ({ pageParam }) =>
      CurationV2Api.getFeed({
        cursor: pageParam,
        size,
        keyword,
        code: codes,
      }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnMount: false,
    enabled: enabled && codes.length > 0,
  });
};

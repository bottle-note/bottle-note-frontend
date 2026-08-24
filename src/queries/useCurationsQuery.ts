import {
  CURATION_V2_SPEC_CODES,
  type CurationV2SortType,
} from '@/api/curation-v2/constants';
import type { SORT_ORDER } from '@/api/_shared/types';
import { useCurationFeedQuery } from '@/queries/useCurationFeedQuery';

export const useCurationsQuery = (
  size = 10,
  keyword?: string,
  enabled = true,
  sortType?: CurationV2SortType,
  sortOrder?: SORT_ORDER,
) => {
  const query = useCurationFeedQuery({
    size,
    keyword,
    code: [
      CURATION_V2_SPEC_CODES.RECOMMENDED_WHISKY,
      CURATION_V2_SPEC_CODES.WHISKY_PAIRING,
    ],
    sortType,
    sortOrder,
    enabled,
  });
  const data = query.data?.flatMap((page) => page.data.items);

  return { ...query, data };
};

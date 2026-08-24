import {
  CURATION_V2_SPEC_CODES,
  type CurationV2SortType,
  type CurationV2SpecCode,
} from '@/api/curation-v2/constants';
import type { SORT_ORDER } from '@/api/_shared/types';
import { isTastingEventFeedItem } from '@/api/curation-v2/guards';
import { curationV2Keys } from '@/queries/curationV2Keys';
import { useCurationFeedQuery } from '@/queries/useCurationFeedQuery';

export { curationV2Keys };

export const useTastingEventsQuery = (
  size = 10,
  keyword?: string,
  code: CurationV2SpecCode = CURATION_V2_SPEC_CODES.WHISKY_TASTING_EVENT,
  enabled = true,
  sortType?: CurationV2SortType,
  sortOrder?: SORT_ORDER,
) => {
  const query = useCurationFeedQuery({
    size,
    keyword,
    code,
    sortType,
    sortOrder,
    enabled,
  });
  const data = query.data
    ?.flatMap((page) => page.data.items)
    .filter(isTastingEventFeedItem);

  return { ...query, data };
};

import {
  CURATION_V2_SPEC_CODES,
  type CurationV2SpecCode,
} from '@/api/curation-v2/constants';
import { isTastingEventFeedItem } from '@/api/curation-v2/guards';
import { curationV2Keys } from '@/queries/curationV2Keys';
import { useCurationFeedQuery } from '@/queries/useCurationFeedQuery';

export { curationV2Keys };

export const useTastingEventsQuery = (
  pageSize = 10,
  keyword?: string,
  code: CurationV2SpecCode = CURATION_V2_SPEC_CODES.WHISKY_TASTING_EVENT,
  enabled = true,
) => {
  const query = useCurationFeedQuery({
    pageSize,
    keyword,
    code,
    enabled,
  });
  const data = query.data
    ?.flatMap((page) => page.data.items)
    .filter(isTastingEventFeedItem);

  return {
    ...query,
    data,
  };
};

import {
  CURATION_V2_SPEC_CODES,
  type CurationV2SpecCode,
} from '@/api/curation-v2/constants';
import { useCurationFeedQuery } from '@/queries/useCurationFeedQuery';

export const useCurationsQuery = (
  pageSize = 10,
  keyword?: string,
  code: CurationV2SpecCode = CURATION_V2_SPEC_CODES.RECOMMENDED_WHISKY,
  enabled = true,
) => {
  const query = useCurationFeedQuery({ pageSize, keyword, code, enabled });
  const data = query.data?.flatMap((page) => page.data.items);

  return {
    ...query,
    data,
  };
};

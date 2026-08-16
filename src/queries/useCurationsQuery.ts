import { CURATION_V2_SPEC_CODES } from '@/api/curation-v2/constants';
import { useCurationFeedQuery } from '@/queries/useCurationFeedQuery';

export const useCurationsQuery = (
  size = 10,
  keyword?: string,
  enabled = true,
) => {
  const query = useCurationFeedQuery({
    size,
    keyword,
    code: [
      CURATION_V2_SPEC_CODES.RECOMMENDED_WHISKY,
      CURATION_V2_SPEC_CODES.WHISKY_PAIRING,
    ],
    enabled,
  });
  const data = query.data?.flatMap((page) => page.data.items);

  return { ...query, data };
};

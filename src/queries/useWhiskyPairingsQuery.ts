import {
  CURATION_V2_SPEC_CODES,
  type CurationV2SpecCode,
} from '@/api/curation-v2/constants';
import { isWhiskyPairingFeedItem } from '@/api/curation-v2/guards';
import { useCurationFeedQuery } from '@/queries/useCurationFeedQuery';

export const useWhiskyPairingsQuery = (
  pageSize = 10,
  keyword?: string,
  code: CurationV2SpecCode = CURATION_V2_SPEC_CODES.WHISKY_PAIRING,
  enabled = true,
) => {
  const query = useCurationFeedQuery({ pageSize, keyword, code, enabled });
  const data = query.data?.flatMap((page) =>
    page.data.items.filter(isWhiskyPairingFeedItem),
  );

  return {
    ...query,
    data,
  };
};

import type {
  CurationV2SortType,
  CurationV2SpecCode,
} from '@/api/curation-v2/constants';
import type { SORT_ORDER } from '@/api/_shared/types';

export const curationV2Keys = {
  all: ['curation-v2'] as const,
  feed: ({
    size,
    keyword,
    code,
    sortType,
    sortOrder,
  }: {
    size: number;
    keyword?: string;
    code: CurationV2SpecCode | readonly CurationV2SpecCode[];
    sortType?: CurationV2SortType;
    sortOrder?: SORT_ORDER;
  }) =>
    [
      ...curationV2Keys.all,
      'feed',
      { size, keyword, code, sortType, sortOrder },
    ] as const,
  curations: (
    size: number,
    keyword: string | undefined,
    code: CurationV2SpecCode,
  ) => [...curationV2Keys.feed({ size, keyword, code }), 'curations'] as const,
  programs: (
    size: number,
    keyword: string | undefined,
    code: CurationV2SpecCode,
  ) => [...curationV2Keys.feed({ size, keyword, code }), 'programs'] as const,
  tastingEvents: (
    size: number,
    keyword: string | undefined,
    code: CurationV2SpecCode,
  ) =>
    [
      ...curationV2Keys.feed({ size, keyword, code }),
      'tasting-events',
    ] as const,
  detail: (curationId: string | number) =>
    [...curationV2Keys.all, 'detail', curationId] as const,
};

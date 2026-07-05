import type { CurationV2SpecCode } from '@/api/curation-v2/constants';

export const curationV2Keys = {
  all: ['curation-v2'] as const,
  feed: ({
    pageSize,
    keyword,
    code,
  }: {
    pageSize: number;
    keyword?: string;
    code?: CurationV2SpecCode;
  }) => [...curationV2Keys.all, 'feed', { pageSize, keyword, code }] as const,
  curations: (pageSize: number, keyword?: string, code?: CurationV2SpecCode) =>
    [...curationV2Keys.feed({ pageSize, keyword, code }), 'curations'] as const,
  tastingEvents: (
    pageSize: number,
    keyword?: string,
    code?: CurationV2SpecCode,
  ) =>
    [
      ...curationV2Keys.feed({ pageSize, keyword, code }),
      'tasting-events',
    ] as const,
  detail: (curationId: string | number) =>
    [...curationV2Keys.all, 'detail', curationId] as const,
};

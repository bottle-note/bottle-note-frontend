import { describe, expect, it } from '@jest/globals';
import type { ApiResponse } from '@/api/_shared/types';
import { getNextPageParam } from '@/queries/usePaginatedQuery';

const createResponse = (pagination?: {
  hasNext: boolean;
  nextCursor: string | null;
}) =>
  ({
    meta: { pagination },
  }) as unknown as ApiResponse<never>;

describe('getNextPageParam', () => {
  it('서버가 내려준 opaque nextCursor를 해석하거나 변경하지 않고 그대로 반환한다', () => {
    const nextCursor = 'eyJpZCI6MzcLCJzb3J0IjoiLz8rPSJ9';

    expect(
      getNextPageParam(createResponse({ hasNext: true, nextCursor })),
    ).toBe(nextCursor);
  });

  it.each([
    { hasNext: false, nextCursor: 'still-present' },
    { hasNext: true, nextCursor: null },
    { hasNext: true, nextCursor: '' },
  ])('terminal meta.pagination=%o에서는 다음 요청을 중지한다', (pagination) => {
    expect(getNextPageParam(createResponse(pagination))).toBeUndefined();
  });

  it('pagination meta가 없으면 cursor를 생성하지 않는다', () => {
    expect(getNextPageParam(createResponse())).toBeUndefined();
  });
});

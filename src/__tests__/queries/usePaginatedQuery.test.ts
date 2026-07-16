import { describe, expect, it } from '@jest/globals';
import type { ApiResponse, PageableInfo } from '@/api/_shared/types';
import { getNextPageParam } from '@/queries/usePaginatedQuery';

const createResponse = (pageable?: PageableInfo) =>
  ({
    meta: { pageable },
  }) as ApiResponse<never>;

describe('getNextPageParam', () => {
  it('서버가 내려준 다음 cursor를 계산 없이 그대로 반환한다', () => {
    const response = createResponse({
      currentCursor: 10,
      cursor: 37,
      pageSize: 10,
      hasNext: true,
    });

    expect(getNextPageParam(response)).toBe(37);
  });

  it('다음 페이지가 없으면 cursor 값과 관계없이 요청을 중지한다', () => {
    const response = createResponse({
      currentCursor: 10,
      cursor: 20,
      pageSize: 10,
      hasNext: false,
    });

    expect(getNextPageParam(response)).toBeUndefined();
  });

  it('다음 페이지 cursor가 누락되면 프론트에서 값을 계산하지 않는다', () => {
    const response = createResponse({
      currentCursor: 10,
      pageSize: 10,
      hasNext: true,
    });

    expect(getNextPageParam(response)).toBeUndefined();
  });
});

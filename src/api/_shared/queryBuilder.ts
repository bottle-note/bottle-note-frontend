// ============================================
// URL Query Parameter Builder
// ============================================

type QueryParamValue = string | number | boolean | undefined | null;

export interface QueryParams {
  [key: string]: QueryParamValue | QueryParamValue[];
}

/**
 * 객체를 URLSearchParams 기반 쿼리 스트링으로 변환합니다.
 *
 * @param params - 변환할 파라미터 객체
 * @returns 쿼리 스트링 (? 제외)
 *
 * @example
 * // 기본 사용
 * buildQueryParams({ keyword: '위스키', page: 1 })
 * // => 'keyword=위스키&page=1'
 *
 * // 배열 파라미터
 * buildQueryParams({ keywords: ['smoky', 'peaty'] })
 * // => 'keywords=smoky&keywords=peaty'
 *
 * // 빈 값 제외
 * buildQueryParams({ keyword: '위스키', sort: undefined, filter: '' })
 * // => 'keyword=위스키'
 */
export function buildQueryParams(params: QueryParams): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    if (Array.isArray(value)) {
      // 배열 파라미터: keywords=a&keywords=b 형식
      value.forEach((v) => {
        if (v !== undefined && v !== null && v !== '') {
          searchParams.append(key, String(v));
        }
      });
    } else {
      searchParams.set(key, String(value));
    }
  });

  return searchParams.toString();
}

/**
 * 쿼리 스트링이 비어있지 않으면 ?를 붙여서 반환합니다.
 *
 * @param queryString - 쿼리 스트링
 * @returns ?가 붙은 쿼리 스트링 또는 빈 문자열
 */
export function withQueryPrefix(queryString: string): string {
  return queryString ? `?${queryString}` : '';
}

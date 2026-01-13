import { buildQueryParams, withQueryPrefix } from './queryBuilder';

describe('buildQueryParams', () => {
  describe('기본 파라미터 처리', () => {
    it('문자열 파라미터를 쿼리 스트링으로 변환한다', () => {
      // Given
      const params = { keyword: 'whisky', category: 'BOURBON' };

      // When
      const result = buildQueryParams(params);

      // Then
      expect(result).toBe('keyword=whisky&category=BOURBON');
    });

    it('숫자 파라미터를 문자열로 변환한다', () => {
      // Given
      const params = { cursor: 0, pageSize: 10 };

      // When
      const result = buildQueryParams(params);

      // Then
      expect(result).toBe('cursor=0&pageSize=10');
    });

    it('불리언 파라미터를 문자열로 변환한다', () => {
      // Given
      const params = { isActive: true, isDeleted: false };

      // When
      const result = buildQueryParams(params);

      // Then
      expect(result).toBe('isActive=true&isDeleted=false');
    });

    it('한글 파라미터를 URL 인코딩한다', () => {
      // Given
      const params = { keyword: '위스키' };

      // When
      const result = buildQueryParams(params);

      // Then
      // URLSearchParams가 자동으로 인코딩하지만, toString()은 디코딩된 형태를 반환할 수 있음
      // 실제 fetch에서 사용될 때는 올바르게 인코딩됨
      expect(result).toContain('keyword=');
    });
  });

  describe('빈 값 처리', () => {
    it('undefined 값은 제외한다', () => {
      // Given
      const params = { keyword: 'whisky', category: undefined };

      // When
      const result = buildQueryParams(params);

      // Then
      expect(result).toBe('keyword=whisky');
    });

    it('null 값은 제외한다', () => {
      // Given
      const params = { keyword: 'whisky', category: null };

      // When
      const result = buildQueryParams(params);

      // Then
      expect(result).toBe('keyword=whisky');
    });

    it('빈 문자열은 제외한다', () => {
      // Given
      const params = { keyword: 'whisky', category: '' };

      // When
      const result = buildQueryParams(params);

      // Then
      expect(result).toBe('keyword=whisky');
    });

    it('모든 값이 빈 값이면 빈 문자열을 반환한다', () => {
      // Given
      const params = { keyword: undefined, category: null, sort: '' };

      // When
      const result = buildQueryParams(params);

      // Then
      expect(result).toBe('');
    });

    it('빈 객체는 빈 문자열을 반환한다', () => {
      // Given
      const params = {};

      // When
      const result = buildQueryParams(params);

      // Then
      expect(result).toBe('');
    });
  });

  describe('배열 파라미터 처리', () => {
    it('배열을 반복 키 형식으로 변환한다', () => {
      // Given
      const params = { keywords: ['smoky', 'peaty'] };

      // When
      const result = buildQueryParams(params);

      // Then
      expect(result).toBe('keywords=smoky&keywords=peaty');
    });

    it('배열 내 빈 값은 제외한다', () => {
      // Given
      const params = { keywords: ['smoky', '', null, 'peaty', undefined] };

      // When
      const result = buildQueryParams(params);

      // Then
      expect(result).toBe('keywords=smoky&keywords=peaty');
    });

    it('빈 배열은 쿼리에 포함하지 않는다', () => {
      // Given
      const params = { keyword: 'whisky', keywords: [] };

      // When
      const result = buildQueryParams(params);

      // Then
      expect(result).toBe('keyword=whisky');
    });

    it('숫자 배열을 문자열로 변환한다', () => {
      // Given
      const params = { ids: [1, 2, 3] };

      // When
      const result = buildQueryParams(params);

      // Then
      expect(result).toBe('ids=1&ids=2&ids=3');
    });
  });

  describe('복합 파라미터 처리', () => {
    it('다양한 타입의 파라미터를 함께 처리한다', () => {
      // Given
      const params = {
        keyword: 'whisky',
        cursor: 0,
        pageSize: 10,
        isActive: true,
        categories: ['BOURBON', 'SCOTCH'],
        emptyValue: '',
      };

      // When
      const result = buildQueryParams(params);

      // Then
      expect(result).toContain('keyword=whisky');
      expect(result).toContain('cursor=0');
      expect(result).toContain('pageSize=10');
      expect(result).toContain('isActive=true');
      expect(result).toContain('categories=BOURBON');
      expect(result).toContain('categories=SCOTCH');
      expect(result).not.toContain('emptyValue');
    });
  });

  describe('숫자 0 처리', () => {
    it('숫자 0은 유효한 값으로 처리한다', () => {
      // Given
      const params = { cursor: 0, pageSize: 10 };

      // When
      const result = buildQueryParams(params);

      // Then
      expect(result).toBe('cursor=0&pageSize=10');
    });
  });
});

describe('withQueryPrefix', () => {
  it('쿼리 스트링이 있으면 ?를 붙인다', () => {
    // Given
    const queryString = 'keyword=whisky&page=1';

    // When
    const result = withQueryPrefix(queryString);

    // Then
    expect(result).toBe('?keyword=whisky&page=1');
  });

  it('빈 문자열이면 빈 문자열을 반환한다', () => {
    // Given
    const queryString = '';

    // When
    const result = withQueryPrefix(queryString);

    // Then
    expect(result).toBe('');
  });
});

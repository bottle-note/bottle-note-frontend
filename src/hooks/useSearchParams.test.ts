import { useRouter, useSearchParams, usePathname } from 'next/navigation';
// eslint-disable-next-line import/no-extraneous-dependencies
import { renderHook, act } from '@testing-library/react';
import useSearchParam from './useSearchParams';

// Next.js navigation hooks를 mock
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
  usePathname: jest.fn(),
}));

describe('useSearchParam 훅', () => {
  const mockReplace = jest.fn();
  const mockPathname = '/search';

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      replace: mockReplace,
    });
    (usePathname as jest.Mock).mockReturnValue(mockPathname);
  });

  describe('쿼리 파라미터 읽기', () => {
    it('URL에서 특정 쿼리 파라미터의 값을 읽을 수 있다', () => {
      // Given: URL에 category=whisky 파라미터가 있을 때
      const mockSearchParams = new URLSearchParams('category=whisky');
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

      // When: useSearchParam 훅을 호출하면
      const { result } = renderHook(() => useSearchParam('category'));

      // Then: 해당 파라미터의 값을 반환한다
      const [value] = result.current;
      expect(value).toBe('whisky');
    });

    it('존재하지 않는 쿼리 파라미터는 null을 반환한다', () => {
      // Given: URL에 쿼리 파라미터가 없을 때
      const mockSearchParams = new URLSearchParams('');
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

      // When: useSearchParam 훅을 호출하면
      const { result } = renderHook(() => useSearchParam('category'));

      // Then: null을 반환한다
      const [value] = result.current;
      expect(value).toBeNull();
    });
  });

  describe('쿼리 파라미터 설정하기', () => {
    it('새로운 쿼리 파라미터를 추가할 수 있다', () => {
      // Given: 빈 URL 상태
      const mockSearchParams = new URLSearchParams('');
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

      const { result } = renderHook(() => useSearchParam('category'));

      // When: 새로운 값을 설정하면
      const [, setValue] = result.current;
      act(() => {
        setValue('bourbon');
      });

      // Then: 해당 파라미터가 추가된 URL로 이동한다
      expect(mockReplace).toHaveBeenCalledWith('/search?category=bourbon');
    });

    it('기존 쿼리 파라미터의 값을 변경할 수 있다', () => {
      // Given: URL에 category=whisky 파라미터가 있을 때
      const mockSearchParams = new URLSearchParams('category=whisky');
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

      const { result } = renderHook(() => useSearchParam('category'));

      // When: 값을 변경하면
      const [, setValue] = result.current;
      act(() => {
        setValue('bourbon');
      });

      // Then: 변경된 파라미터로 URL이 업데이트된다
      expect(mockReplace).toHaveBeenCalledWith('/search?category=bourbon');
    });

    it('다른 쿼리 파라미터는 유지하면서 특정 파라미터만 변경할 수 있다', () => {
      // Given: URL에 여러 파라미터가 있을 때
      const mockSearchParams = new URLSearchParams(
        'category=whisky&sort=recent&page=2',
      );
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

      const { result } = renderHook(() => useSearchParam('category'));

      // When: 특정 파라미터만 변경하면
      const [, setValue] = result.current;
      act(() => {
        setValue('bourbon');
      });

      // Then: 다른 파라미터는 유지된 채로 해당 파라미터만 변경된다
      expect(mockReplace).toHaveBeenCalledWith(
        '/search?category=bourbon&sort=recent&page=2',
      );
    });
  });

  describe('쿼리 파라미터 삭제하기', () => {
    it('null을 전달하면 해당 쿼리 파라미터가 삭제된다', () => {
      // Given: URL에 category=whisky 파라미터가 있을 때
      const mockSearchParams = new URLSearchParams('category=whisky');
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

      const { result } = renderHook(() => useSearchParam('category'));

      // When: null을 설정하면
      const [, setValue] = result.current;
      act(() => {
        setValue(null);
      });

      // Then: 해당 파라미터가 제거된 URL로 이동한다
      expect(mockReplace).toHaveBeenCalledWith('/search');
    });

    it('다른 쿼리 파라미터는 유지하면서 특정 파라미터만 삭제할 수 있다', () => {
      // Given: URL에 여러 파라미터가 있을 때
      const mockSearchParams = new URLSearchParams(
        'category=whisky&sort=recent&page=2',
      );
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

      const { result } = renderHook(() => useSearchParam('category'));

      // When: 특정 파라미터를 삭제하면
      const [, setValue] = result.current;
      act(() => {
        setValue(null);
      });

      // Then: 다른 파라미터는 유지된 채로 해당 파라미터만 삭제된다
      expect(mockReplace).toHaveBeenCalledWith('/search?sort=recent&page=2');
    });

    it('모든 파라미터가 삭제되면 쿼리 스트링 없이 경로만 남는다', () => {
      // Given: URL에 하나의 파라미터만 있을 때
      const mockSearchParams = new URLSearchParams('category=whisky');
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

      const { result } = renderHook(() => useSearchParam('category'));

      // When: 해당 파라미터를 삭제하면
      const [, setValue] = result.current;
      act(() => {
        setValue(null);
      });

      // Then: 쿼리 스트링 없이 경로만 남는다
      expect(mockReplace).toHaveBeenCalledWith('/search');
    });
  });

  describe('페이지 이동 동작', () => {
    it('router.replace를 사용하여 브라우저 히스토리를 추가하지 않는다', () => {
      // Given: URL 파라미터 훅이 초기화되었을 때
      const mockSearchParams = new URLSearchParams('');
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

      const { result } = renderHook(() => useSearchParam('filter'));

      // When: 파라미터를 변경하면
      const [, setValue] = result.current;
      act(() => {
        setValue('active');
      });

      // Then: replace 메서드가 호출되어 히스토리가 쌓이지 않는다
      expect(mockReplace).toHaveBeenCalledTimes(1);
      expect(mockReplace).toHaveBeenCalledWith('/search?filter=active');
    });
  });
});

// eslint-disable-next-line import/no-extraneous-dependencies
import { renderHook, act } from '@testing-library/react';
import { useProgressiveImage } from './useProgressiveImage';

describe('useProgressiveImage 훅', () => {
  describe('placeholder가 있는 경우', () => {
    it('hasPlaceholder가 true를 반환한다', () => {
      // Given: placeholder 이미지가 있을 때
      const { result } = renderHook(() =>
        useProgressiveImage({
          src: '/heavy-image.webp',
          placeholderSrc: '/light-image.webp',
        }),
      );

      // Then: hasPlaceholder가 true
      expect(result.current.hasPlaceholder).toBe(true);
    });

    it('lightSrc로 placeholder 이미지를 반환한다', () => {
      // Given: placeholder 이미지가 있을 때
      const { result } = renderHook(() =>
        useProgressiveImage({
          src: '/heavy-image.webp',
          placeholderSrc: '/light-image.webp',
        }),
      );

      // Then: lightSrc는 placeholder 이미지
      expect(result.current.lightSrc).toBe('/light-image.webp');
    });

    it('heavySrc로 원본 이미지를 반환한다', () => {
      // Given: placeholder 이미지가 있을 때
      const { result } = renderHook(() =>
        useProgressiveImage({
          src: '/heavy-image.webp',
          placeholderSrc: '/light-image.webp',
        }),
      );

      // Then: heavySrc는 원본 이미지
      expect(result.current.heavySrc).toBe('/heavy-image.webp');
    });

    it('shouldShowSkeleton이 false를 반환한다', () => {
      // Given: placeholder 이미지가 있을 때
      const { result } = renderHook(() =>
        useProgressiveImage({
          src: '/heavy-image.webp',
          placeholderSrc: '/light-image.webp',
        }),
      );

      // Then: 스켈레톤을 보여주지 않음 (placeholder가 있으므로)
      expect(result.current.shouldShowSkeleton).toBe(false);
    });

    it('초기 isLoaded 상태는 false이다', () => {
      // Given: 훅 초기화
      const { result } = renderHook(() =>
        useProgressiveImage({
          src: '/heavy-image.webp',
          placeholderSrc: '/light-image.webp',
        }),
      );

      // Then: 아직 로드되지 않음
      expect(result.current.isLoaded).toBe(false);
    });

    it('onHeavyLoad 호출 시 isLoaded가 true로 변경된다', () => {
      // Given: 훅 초기화
      const { result } = renderHook(() =>
        useProgressiveImage({
          src: '/heavy-image.webp',
          placeholderSrc: '/light-image.webp',
        }),
      );

      // When: onHeavyLoad 호출
      act(() => {
        result.current.onHeavyLoad();
      });

      // Then: isLoaded가 true
      expect(result.current.isLoaded).toBe(true);
    });
  });

  describe('placeholder가 없는 경우', () => {
    it('hasPlaceholder가 false를 반환한다', () => {
      // Given: placeholder 이미지가 없을 때
      const { result } = renderHook(() =>
        useProgressiveImage({
          src: '/image.webp',
        }),
      );

      // Then: hasPlaceholder가 false
      expect(result.current.hasPlaceholder).toBe(false);
    });

    it('lightSrc로 원본 이미지를 반환한다', () => {
      // Given: placeholder 이미지가 없을 때
      const { result } = renderHook(() =>
        useProgressiveImage({
          src: '/image.webp',
        }),
      );

      // Then: lightSrc는 원본 이미지
      expect(result.current.lightSrc).toBe('/image.webp');
    });

    it('초기 상태에서 shouldShowSkeleton이 true를 반환한다', () => {
      // Given: placeholder 없고 아직 로드 안됨
      const { result } = renderHook(() =>
        useProgressiveImage({
          src: '/image.webp',
        }),
      );

      // Then: 스켈레톤을 보여줌
      expect(result.current.shouldShowSkeleton).toBe(true);
    });

    it('onHeavyLoad 호출 후 shouldShowSkeleton이 false로 변경된다', () => {
      // Given: placeholder 없는 상태
      const { result } = renderHook(() =>
        useProgressiveImage({
          src: '/image.webp',
        }),
      );

      // When: 이미지 로드 완료
      act(() => {
        result.current.onHeavyLoad();
      });

      // Then: 스켈레톤 숨김
      expect(result.current.shouldShowSkeleton).toBe(false);
      expect(result.current.isLoaded).toBe(true);
    });
  });

  describe('onHeavyLoad 콜백', () => {
    it('여러 번 호출해도 안전하게 동작한다', () => {
      // Given: 훅 초기화
      const { result } = renderHook(() =>
        useProgressiveImage({
          src: '/image.webp',
          placeholderSrc: '/placeholder.webp',
        }),
      );

      // When: onHeavyLoad 여러 번 호출
      act(() => {
        result.current.onHeavyLoad();
        result.current.onHeavyLoad();
        result.current.onHeavyLoad();
      });

      // Then: 에러 없이 isLoaded가 true 유지
      expect(result.current.isLoaded).toBe(true);
    });
  });
});

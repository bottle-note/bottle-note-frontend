import { transformReviewAlcoholInfo } from './transformers';
import type { ReviewAlcoholInfoRaw } from './types';

describe('transformReviewAlcoholInfo', () => {
  it('engCategoryName을 engCategory로 변환한다', () => {
    // Given
    const raw: ReviewAlcoholInfoRaw = {
      alcoholId: 1,
      korName: '글렌피딕 12년',
      engName: 'Glenfiddich 12',
      engCategoryName: 'SINGLE_MALT',
      korCategoryName: '싱글몰트',
      imageUrl: 'https://example.com/image.jpg',
      isPicked: true,
      rating: 4.5,
      totalRatingsCount: 100,
    };

    // When
    const result = transformReviewAlcoholInfo(raw);

    // Then
    expect(result.engCategory).toBe('SINGLE_MALT');
    expect(result.korCategory).toBe('싱글몰트');
    expect(result).not.toHaveProperty('engCategoryName');
    expect(result).not.toHaveProperty('korCategoryName');
  });

  it('기존 engCategory 필드가 있으면 그대로 사용한다', () => {
    // Given
    const raw: ReviewAlcoholInfoRaw = {
      alcoholId: 1,
      korName: '글렌피딕 12년',
      engName: 'Glenfiddich 12',
      engCategory: 'SINGLE_MALT',
      korCategory: '싱글몰트',
      imageUrl: 'https://example.com/image.jpg',
      isPicked: true,
      rating: 4.5,
      totalRatingsCount: 100,
    };

    // When
    const result = transformReviewAlcoholInfo(raw);

    // Then
    expect(result.engCategory).toBe('SINGLE_MALT');
    expect(result.korCategory).toBe('싱글몰트');
  });

  it('카테고리 필드가 없으면 빈 문자열을 사용한다', () => {
    // Given
    const raw: ReviewAlcoholInfoRaw = {
      alcoholId: 1,
      korName: '글렌피딕 12년',
      engName: 'Glenfiddich 12',
      imageUrl: 'https://example.com/image.jpg',
      isPicked: true,
      rating: 4.5,
      totalRatingsCount: 100,
    };

    // When
    const result = transformReviewAlcoholInfo(raw);

    // Then
    expect(result.engCategory).toBe('');
    expect(result.korCategory).toBe('');
  });
});

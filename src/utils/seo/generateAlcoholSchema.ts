import { AlcoholInfo } from '@/types/Alcohol';
import { Review } from '@/types/Review';
import { BASE_URL } from '@/constants/common';

/**
 * 위스키 상세 정보를 Schema.org Product 형식으로 변환합니다.
 * @param alcohol 위스키 상세 정보
 * @param reviews 리뷰 목록 (최대 3개 권장)
 * @returns Schema.org Product JSON-LD
 */
export function generateAlcoholSchema(
  alcohol: AlcoholInfo,
  reviews?: Review[],
) {
  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: alcohol.korName,
    alternateName: [alcohol.engName],
    image: alcohol.alcoholUrlImg,
    description: `${alcohol.korName} - ${alcohol.engCategory} | ${alcohol.engDistillery || '증류소 정보 없음'}에서 생산한 위스키입니다. 도수: ${alcohol.abv || '정보 없음'}, 지역: ${alcohol.korRegion || alcohol.engRegion || '정보 없음'}`,
    brand: {
      '@type': 'Brand',
      name: alcohol.korDistillery || alcohol.engDistillery || alcohol.korName,
    },
    category: alcohol.korCategory,
    url: `${BASE_URL}/search/${alcohol.engCategory}/${alcohol.alcoholId}`,
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: '도수',
        value: alcohol.abv || '-',
      },
      {
        '@type': 'PropertyValue',
        name: '캐스크',
        value: alcohol.cask || '-',
      },
      {
        '@type': 'PropertyValue',
        name: '국가/지역',
        value: alcohol.korRegion || alcohol.engRegion || '-',
      },
      {
        '@type': 'PropertyValue',
        name: '증류소',
        value: alcohol.korDistillery || alcohol.engDistillery || '-',
      },
    ].filter((prop) => prop.value !== '-'),
  };

  if (alcohol.totalRatingsCount > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: alcohol.rating.toFixed(1),
      ratingCount: alcohol.totalRatingsCount,
      bestRating: 5,
      worstRating: 0,
    };
  }

  if (reviews && reviews.length > 0) {
    schema.review = reviews.slice(0, 3).map((review) => ({
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 0,
      },
      author: {
        '@type': 'Person',
        name: review.userInfo.nickName,
        image: review.userInfo.userProfileImage,
      },
      datePublished: review.createAt,
      reviewBody: review.reviewContent,
      ...(review.reviewImageUrl && { image: review.reviewImageUrl }),
    }));
  }

  return schema;
}

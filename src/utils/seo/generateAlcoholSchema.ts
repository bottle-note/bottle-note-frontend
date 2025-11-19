import { AlcoholInfo } from '@/types/Alcohol';
import { BASE_URL } from '@/constants/common';

/**
 * 위스키 상세 정보를 Schema.org Product 형식으로 변환합니다.
 * @param alcohol 위스키 상세 정보
 * @returns Schema.org Product JSON-LD
 */
export function generateAlcoholSchema(alcohol: AlcoholInfo) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: alcohol.korName,
    alternateName: alcohol.engName,
    image: alcohol.alcoholUrlImg,
    description: `${alcohol.korName} - ${alcohol.engCategory} | ${alcohol.engDistillery || '증류소 정보 없음'}에서 생산한 위스키입니다. 도수: ${alcohol.abv || '정보 없음'}, 지역: ${alcohol.korRegion || alcohol.engRegion || '정보 없음'}`,
    brand: {
      '@type': 'Brand',
      name: alcohol.engDistillery || alcohol.korDistillery || alcohol.korName,
    },
    category: alcohol.korCategory,
    aggregateRating:
      alcohol.totalRatingsCount > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: alcohol.rating.toFixed(1),
            ratingCount: alcohol.totalRatingsCount,
            bestRating: 5,
            worstRating: 0,
          }
        : undefined,
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'KRW',
      availability: 'https://schema.org/InStock',
      url: `${BASE_URL}/search/${alcohol.engCategory}/${alcohol.alcoholId}`,
    },
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
}

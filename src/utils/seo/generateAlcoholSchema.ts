import { AlcoholInfo } from '@/api/alcohol/types';
import { BASE_URL } from '@/constants/common';
import { alcoholCanonicalPath } from '@/shared/seo/alcoholMetadata';

/**
 * 위스키 상세 정보를 Schema.org Product 형식으로 변환합니다.
 * 보틀 조회는 캐시되므로 비공개 전환·삭제가 늦게 반영될 수 있는 개별 리뷰 본문은 넣지 않습니다.
 * @param alcohol 위스키 상세 정보
 * @returns Schema.org Product JSON-LD
 */
export function generateAlcoholSchema(alcohol: AlcoholInfo) {
  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: alcohol.korName,
    alternateName: [alcohol.engName],
    image: alcohol.alcoholUrlImg,
    description:
      alcohol.description?.trim() ||
      `${alcohol.korName} - ${alcohol.engCategory} | ${alcohol.engDistillery || '증류소 정보 없음'}에서 생산한 위스키입니다. 도수: ${alcohol.abv || '정보 없음'}, 지역: ${alcohol.korRegion || alcohol.engRegion || '정보 없음'}`,
    brand: {
      '@type': 'Brand',
      name: alcohol.korDistillery || alcohol.engDistillery || alcohol.korName,
    },
    category: alcohol.korCategory,
    url: `${BASE_URL}${alcoholCanonicalPath(alcohol.alcoholId)}`,
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

  // 평가가 없는 aggregateRating은 구조화 데이터 오류로 처리된다.
  if (alcohol.totalRatingsCount > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: alcohol.rating.toFixed(1),
      ratingCount: alcohol.totalRatingsCount,
      bestRating: 5,
      worstRating: 0,
    };
  }

  return schema;
}

/**
 * 위스키 상세 페이지를 Schema.org WebPage로 표현하고, 게스트에게 가려지는 영역을
 * 로그인 제한 콘텐츠로 표시합니다. 가려진 영역을 숨긴 텍스트(클로킹)로 오해받지 않게 하는
 * Google의 구독·로그인 제한 콘텐츠 구조화 데이터 방식입니다.
 * @param alcohol 위스키 상세 정보
 * @param gatedContentSelector 게스트에게 가려지는 영역의 CSS 선택자
 * @returns Schema.org WebPage JSON-LD
 */
export function generateAlcoholPageSchema(
  alcohol: AlcoholInfo,
  gatedContentSelector: string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: alcohol.korName || alcohol.engName,
    url: `${BASE_URL}${alcoholCanonicalPath(alcohol.alcoholId)}`,
    isAccessibleForFree: false,
    hasPart: {
      '@type': 'WebPageElement',
      isAccessibleForFree: false,
      cssSelector: gatedContentSelector,
    },
  };
}

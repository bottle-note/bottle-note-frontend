import { BASE_URL } from '@/constants/common';

/**
 * 홈페이지를 위한 WebSite와 Organization Schema를 생성합니다.
 * @returns Schema.org WebSite 및 Organization JSON-LD 배열
 */
export function generateWebSiteSchema() {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Bottle Note',
      alternateName: '보틀노트',
      url: BASE_URL,
      description:
        '위스키 라이프를 기록하다 - 위스키 리뷰, 평점, 테이스팅 노트를 공유하는 플랫폼',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${BASE_URL}/search?keyword={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
      inLanguage: 'ko-KR',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Bottle Note',
      alternateName: '보틀노트',
      url: BASE_URL,
      logo: `${BASE_URL}/logo.png`,
      description: '위스키 라이프를 기록하고 공유하는 커뮤니티 플랫폼',
      sameAs: ['https://www.instagram.com/bottle_note_official'],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        availableLanguage: ['Korean', 'English'],
      },
    },
  ];
}

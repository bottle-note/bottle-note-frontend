import { AlcoholInfo, Review } from '@/types/Review';
import { BASE_URL } from '@/constants/common';

/**
 * 리뷰 정보를 Schema.org Review 형식으로 변환합니다.
 * @param alcoholInfo 위스키 정보
 * @param reviewInfo 리뷰 정보
 * @returns Schema.org Review JSON-LD
 */
export function generateReviewSchema(
  alcoholInfo: AlcoholInfo,
  reviewInfo: Review,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Product',
      name: alcoholInfo.korName,
      alternateName: alcoholInfo.engName,
      image: alcoholInfo.imageUrl,
      category: alcoholInfo.korCategory,
      aggregateRating:
        alcoholInfo.totalRatingsCount > 0
          ? {
              '@type': 'AggregateRating',
              ratingValue: alcoholInfo.rating.toFixed(1),
              ratingCount: alcoholInfo.totalRatingsCount,
              bestRating: 5,
              worstRating: 0,
            }
          : undefined,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: reviewInfo.rating,
      bestRating: 5,
      worstRating: 0,
    },
    author: {
      '@type': 'Person',
      name: reviewInfo.userInfo.nickName,
      image: reviewInfo.userInfo.userProfileImage,
    },
    datePublished: reviewInfo.createAt,
    reviewBody: reviewInfo.reviewContent,
    image: reviewInfo.reviewImageUrl || undefined,
    publisher: {
      '@type': 'Organization',
      name: 'Bottle Note',
      url: BASE_URL,
    },
  };
}

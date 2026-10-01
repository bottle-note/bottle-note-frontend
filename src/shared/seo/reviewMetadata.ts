import type { Metadata } from 'next';
import type { ReviewDetailsResponse } from '@/api/review/types';
import { ROUTES } from '@/constants/routes';
import type { SeoFetchResult } from './productApi';
import { joinSentences, normalizeText, truncateText } from './text';

const REVIEW_SNIPPET_LENGTH = 120;
const NOINDEX = { index: false, follow: false } as const;

export const isPublicReview = (data: ReviewDetailsResponse) =>
  data.reviewInfo.status === 'PUBLIC';

function alcoholName(data: ReviewDetailsResponse) {
  return (
    normalizeText(data.alcoholInfo.korName) ||
    normalizeText(data.alcoholInfo.engName)
  );
}

export function buildReviewDescription(data: ReviewDetailsResponse): string {
  const { reviewInfo } = data;
  const nickName = normalizeText(reviewInfo.userInfo?.nickName);
  const rating = reviewInfo.rating > 0 ? `별점 ${reviewInfo.rating}점` : null;
  const lead = `${nickName ? `${nickName}님의 ` : ''}${alcoholName(data)} 리뷰${rating ? `(${rating})` : ''}.`;
  const content = normalizeText(reviewInfo.reviewContent);

  return truncateText(
    joinSentences([
      lead,
      content
        ? truncateText(content, REVIEW_SNIPPET_LENGTH)
        : '테이스팅 노트를 확인하세요.',
    ]),
  );
}

export function buildReviewMetadata(
  id: string,
  result: SeoFetchResult<ReviewDetailsResponse>,
): Metadata {
  const canonical = ROUTES.REVIEW.DETAIL(id);

  if (result.status === 'not-found') {
    return { title: '위스키 리뷰', robots: NOINDEX };
  }
  if (result.status === 'error') {
    return {
      title: '위스키 리뷰',
      description: '위스키 테이스팅 노트를 확인하세요.',
      alternates: { canonical },
    };
  }

  const { data } = result;
  // 비공개 리뷰 본문이 HTML 메타로 노출되지 않게 한다.
  if (!isPublicReview(data)) {
    return { title: '위스키 리뷰', robots: NOINDEX };
  }

  const { reviewInfo, reviewImageList } = data;
  const name = alcoholName(data);
  const nickName = normalizeText(reviewInfo.userInfo?.nickName);
  const title = nickName
    ? `${name} 후기 - ${nickName}님의 테이스팅 노트`
    : `${name} 후기`;
  const description = buildReviewDescription(data);
  const imageUrl = reviewImageList?.[0]?.viewUrl || data.alcoholInfo.imageUrl;

  return {
    title,
    description,
    keywords: [
      data.alcoholInfo.korName,
      data.alcoholInfo.engName,
      name && `${name} 후기`,
      name && `${name} 리뷰`,
      data.alcoholInfo.korCategory,
      '위스키 리뷰',
      '테이스팅 노트',
      '보틀노트',
    ]
      .map((keyword) => normalizeText(keyword || ''))
      .filter(Boolean),
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'article',
      publishedTime: reviewInfo.createAt,
      authors: nickName ? [nickName] : undefined,
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

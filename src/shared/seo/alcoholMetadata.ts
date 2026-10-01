import type { Metadata } from 'next';
import type { AlcoholDetailsResponse, AlcoholInfo } from '@/api/alcohol/types';
import { ROUTES } from '@/constants/routes';
import type { SeoFetchResult } from './productApi';
import { sectionTitle } from './site';
import {
  formatAverageRating,
  joinSentences,
  normalizeText,
  truncateText,
} from './text';

const TOP_TASTING_TAG_COUNT = 3;
const NOINDEX = { index: false, follow: false } as const;
// 증류소 정보가 없을 때 들어오는 자리표시 값
const PLACEHOLDER_VALUES = new Set(['-', 'ETC']);

export const alcoholCanonicalPath = (id: string | number) =>
  ROUTES.ALCOHOL.DETAIL(id);

export const alcoholReviewsCanonicalPath = (id: string | number) =>
  ROUTES.ALCOHOL.REVIEWS(id);

function displayName(alcohol: AlcoholInfo) {
  const korName = normalizeText(alcohol.korName);
  const engName = normalizeText(alcohol.engName);
  if (korName && engName && korName !== engName) {
    return `${korName}(${engName})`;
  }
  return korName || engName;
}

function primaryName(alcohol: AlcoholInfo) {
  return normalizeText(alcohol.korName) || normalizeText(alcohol.engName);
}

function formatAbv(abv: string | null | undefined) {
  const value = normalizeText(abv);
  if (!value) return null;
  return /^\d+(\.\d+)?$/.test(value) ? `${value}%` : value;
}

function specSentence(alcohol: AlcoholInfo) {
  const specs = [
    normalizeText(alcohol.korCategory) || normalizeText(alcohol.engCategory),
    normalizeText(alcohol.korRegion) || normalizeText(alcohol.engRegion),
    formatAbv(alcohol.abv),
  ].filter(Boolean);

  return specs.length > 0
    ? `${displayName(alcohol)} · ${specs.join(' · ')}.`
    : `${displayName(alcohol)}.`;
}

function tastingTagSentence(alcohol: AlcoholInfo) {
  const tags = (alcohol.alcoholsTastingTags ?? [])
    .map(normalizeText)
    .filter(Boolean)
    .slice(0, TOP_TASTING_TAG_COUNT);

  return tags.length > 0 ? `${tags.join('·')} 노트.` : null;
}

function keywords(alcohol: AlcoholInfo) {
  const name = primaryName(alcohol);
  return [
    alcohol.korName,
    alcohol.engName,
    name && `${name} 후기`,
    name && `${name} 맛`,
    alcohol.korDistillery,
    alcohol.engDistillery,
    alcohol.korCategory,
    alcohol.engCategory,
    alcohol.korRegion,
    '위스키',
    '위스키 리뷰',
  ]
    .map((keyword) => normalizeText(keyword || ''))
    .filter((keyword) => keyword && !PLACEHOLDER_VALUES.has(keyword));
}

function socialMetadata(
  title: string,
  description: string,
  url: string,
  imageUrl: string | null | undefined,
): Pick<Metadata, 'openGraph' | 'twitter'> {
  return {
    openGraph: {
      title,
      description,
      url,
      type: 'website',
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

export function buildAlcoholDescription(alcohol: AlcoholInfo): string {
  const tagSentence = tastingTagSentence(alcohol);
  const ratingSentence = formatAverageRating(
    alcohol.rating,
    alcohol.totalRatingsCount,
  );
  const intro = normalizeText(alcohol.description);

  return truncateText(
    joinSentences([
      specSentence(alcohol),
      tagSentence,
      ratingSentence,
      intro || '테이스팅 노트와 리뷰를 확인하세요.',
    ]),
  );
}

export function buildAlcoholMetadata(
  id: string,
  result: SeoFetchResult<AlcoholDetailsResponse>,
): Metadata {
  const canonical = alcoholCanonicalPath(id);

  if (result.status === 'not-found') {
    return { title: sectionTitle('위스키 상세'), robots: NOINDEX };
  }
  if (result.status === 'error' || !result.data?.alcohols) {
    return { title: sectionTitle('위스키 상세'), alternates: { canonical } };
  }

  const { alcohols } = result.data;
  const title = `${primaryName(alcohols)} 맛·향·후기`;
  const description = buildAlcoholDescription(alcohols);

  return {
    // 하위 리뷰 목록 페이지에도 사이트명 template이 이어지게 한다.
    title: sectionTitle(title),
    description,
    keywords: keywords(alcohols),
    alternates: { canonical },
    ...socialMetadata(title, description, canonical, alcohols.alcoholUrlImg),
  };
}

export function buildAlcoholReviewsMetadata(
  id: string,
  result: SeoFetchResult<AlcoholDetailsResponse>,
): Metadata {
  const canonical = alcoholReviewsCanonicalPath(id);

  if (result.status === 'not-found') {
    return { title: '위스키 리뷰', robots: NOINDEX };
  }
  if (result.status === 'error' || !result.data?.alcohols) {
    return { title: '위스키 리뷰', alternates: { canonical } };
  }

  const { alcohols } = result.data;
  const name = primaryName(alcohols);
  const reviewCount = alcohols.reviewCount ?? 0;
  const title =
    reviewCount > 0 ? `${name} 리뷰 ${reviewCount}개` : `${name} 리뷰`;
  const description = truncateText(
    joinSentences([
      reviewCount > 0
        ? `보틀노트 사용자들이 남긴 ${displayName(alcohols)} 리뷰 ${reviewCount.toLocaleString('ko-KR')}개.`
        : `보틀노트 사용자들이 남긴 ${displayName(alcohols)} 리뷰.`,
      formatAverageRating(alcohols.rating, alcohols.totalRatingsCount),
      tastingTagSentence(alcohols),
      '직접 마신 후기와 테이스팅 노트를 확인하세요.',
    ]),
  );

  return {
    title,
    description,
    keywords: keywords(alcohols),
    alternates: { canonical },
    ...socialMetadata(title, description, canonical, alcohols.alcoholUrlImg),
  };
}

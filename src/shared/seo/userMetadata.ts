import type { Metadata } from 'next';
import type { UserInfo } from '@/api/user/types';
import type { SeoFetchResult } from './productApi';
import { sectionTitle } from './site';
import { normalizeText } from './text';

// 사용자 페이지는 robots.txt로 크롤링을 막고 있다. 공유 미리보기용 메타만 만든다.
const NOINDEX = { index: false, follow: false } as const;

export function buildUserMetadata(result: SeoFetchResult<UserInfo>): Metadata {
  if (result.status !== 'ok') {
    return { title: sectionTitle('마이페이지'), robots: NOINDEX };
  }

  const nickName = normalizeText(result.data.nickName);
  const title = nickName ? `${nickName}님의 위스키 기록` : '마이페이지';
  const { reviewCount, ratingCount, pickCount } = result.data;
  const description = `리뷰 ${reviewCount ?? 0}개 · 별점 ${ratingCount ?? 0}개 · 찜 ${pickCount ?? 0}개. 보틀노트에서 위스키 취향을 확인하세요.`;
  const imageUrl = result.data.imageUrl || undefined;

  return {
    title: sectionTitle(title),
    description,
    robots: NOINDEX,
    openGraph: {
      title,
      description,
      type: 'profile',
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

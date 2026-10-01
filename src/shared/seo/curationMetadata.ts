import type { Metadata } from 'next';
import type { CurationV2DetailItem } from '@/api/curation-v2/types';
import { ROUTES } from '@/constants/routes';
import type { SeoFetchResult } from './productApi';
import { joinSentences, normalizeText, truncateText } from './text';

const NOINDEX = { index: false, follow: false } as const;
const FALLBACK_DESCRIPTION =
  '보틀노트가 추천하는 위스키 큐레이션과 시음회 정보를 확인하세요.';

export function buildCurationMetadata(
  id: string,
  result: SeoFetchResult<CurationV2DetailItem>,
): Metadata {
  const canonical = ROUTES.CURATION.DETAIL(id);

  if (result.status === 'not-found') {
    return { title: '큐레이션', robots: NOINDEX };
  }
  if (result.status === 'error') {
    return {
      title: '큐레이션',
      description: FALLBACK_DESCRIPTION,
      alternates: { canonical },
    };
  }

  const curation = result.data;
  const name = normalizeText(curation.name);
  const specName = normalizeText(curation.spec?.name);
  const title = name
    ? `${name}${specName ? ` - ${specName}` : ''}`
    : '큐레이션';
  const description = truncateText(
    joinSentences([curation.description || FALLBACK_DESCRIPTION]),
  );
  const imageUrl = curation.coverImageUrl || curation.imageUrls?.[0];

  return {
    title,
    description,
    keywords: [name, specName, '위스키 큐레이션', '위스키 시음회', '보틀노트']
      .map(normalizeText)
      .filter(Boolean),
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'article',
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

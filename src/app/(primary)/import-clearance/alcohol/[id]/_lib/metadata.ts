import type { Metadata } from 'next';
import type { MfdsAlcoholDetail } from '@/api/mfds/types';
import { ROUTES } from '@/constants/routes';
import type { PublicApiResult } from '@/shared/api/internalApi';
import { joinSentences, normalizeText, truncateText } from '@/shared/seo/text';
import { declarationName } from '../../../_lib/declaration';

const FALLBACK_TITLE = '수입통관 정보';
const FALLBACK_DESCRIPTION = '보틀노트에서 주류 수입통관 정보를 확인하세요.';

export function buildImportClearanceAlcoholMetadata(
  id: string,
  result: PublicApiResult<MfdsAlcoholDetail>,
): Metadata {
  if (result.status === 'not-found') {
    return { title: FALLBACK_TITLE, robots: { index: false, follow: false } };
  }

  const canonical = ROUTES.IMPORT_CLEARANCE.ALCOHOL(id);
  if (result.status === 'error') {
    return {
      title: FALLBACK_TITLE,
      description: FALLBACK_DESCRIPTION,
      alternates: { canonical },
      robots: { index: true, follow: true },
    };
  }

  const item = result.data;
  const { korName, engName } = declarationName(item);
  const name = normalizeText(korName) || normalizeText(engName);
  const title = name ? `${name} 수입통관 정보` : FALLBACK_TITLE;
  const description = truncateText(
    joinSentences([
      name ? `${name}의 수입통관 정보입니다.` : FALLBACK_DESCRIPTION,
      normalizeText(item.alcoholCategoryKo),
      item.abvPercent !== null ? `도수 ${item.abvPercent}%` : null,
      item.volumeMl !== null ? `용량 ${item.volumeMl}ml` : null,
      normalizeText(item.exportCountryNameKo)
        ? `수출국 ${normalizeText(item.exportCountryNameKo)}`
        : null,
    ]),
  );

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'article',
      images: [{ url: '/bottle_note_meta.png' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/bottle_note_meta.png'],
    },
  };
}

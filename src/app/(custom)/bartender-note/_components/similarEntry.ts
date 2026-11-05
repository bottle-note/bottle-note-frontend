import { ROUTES } from '@/constants/routes';

/** 주류 상세에서 "비슷한 위스키 추천받기"로 들어올 때 받는 기준 위스키와 고른 태그. */
export interface SimilarEntry {
  alcoholId: number;
  /** 대사에서 부르는 이름. 없으면 이름 없이 말한다. */
  name?: string;
  tags: string[];
}

/** 주류 상세가 바텐더 노트로 보낼 주소. 받는 쪽은 parseSimilarEntry가 읽는다. */
export function similarEntryHref({ alcoholId, name, tags }: SimilarEntry) {
  const params = new URLSearchParams({
    from: 'similar',
    alcoholId: String(alcoholId),
  });
  if (name) params.set('name', name);
  if (tags.length > 0) params.set('tags', tags.join(','));
  return `${ROUTES.BARTENDER_NOTE}?${params.toString()}`;
}

type SearchParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

/** 주소가 잘못됐거나 태그가 없으면 기본 첫 화면으로 들어가도록 null을 준다. */
export function parseSimilarEntry(params: SearchParams): SimilarEntry | null {
  if (first(params.from) !== 'similar') return null;
  const alcoholId = Number(first(params.alcoholId));
  if (!Number.isInteger(alcoholId) || alcoholId <= 0) return null;
  const tags = (first(params.tags) ?? '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
  if (tags.length === 0) return null;
  const name = first(params.name)?.trim();
  return { alcoholId, name: name || undefined, tags };
}

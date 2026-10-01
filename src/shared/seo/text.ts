/** 검색 결과 스니펫에서 잘리지 않는 description 길이의 기준. */
export const DESCRIPTION_MAX_LENGTH = 150;

/** 줄바꿈·연속 공백을 한 칸으로 정리한다. */
export function normalizeText(text: string | null | undefined): string {
  return (text ?? '').replace(/\s+/g, ' ').trim();
}

/** 최대 길이를 넘으면 단어 경계에서 자르고 말줄임표를 붙인다. */
export function truncateText(
  text: string,
  maxLength: number = DESCRIPTION_MAX_LENGTH,
): string {
  if (text.length <= maxLength) return text;

  const sliced = text.slice(0, maxLength - 1);
  const lastSpace = sliced.lastIndexOf(' ');
  const cut = lastSpace > maxLength * 0.6 ? sliced.slice(0, lastSpace) : sliced;

  return `${cut.replace(/[\s,.·]+$/, '')}…`;
}

/** 비어 있는 조각을 빼고 문장을 잇는다. */
export function joinSentences(parts: (string | null | undefined | false)[]) {
  return parts
    .map((part) => normalizeText(part || ''))
    .filter(Boolean)
    .join(' ');
}

/** 별점 평가가 있을 때만 "평균 별점 3.8점(16명)" 문구를 만든다. */
export function formatAverageRating(
  rating: number | null | undefined,
  count: number | null | undefined,
): string | null {
  if (!rating || !count) return null;
  return `평균 별점 ${rating.toFixed(1)}점(${count.toLocaleString('ko-KR')}명).`;
}

/**
 * 술 설명 원문을 문단 목록으로 정리한다.
 * 빈 줄(공백만 있는 줄 포함)에서 문단을 나누고, 문단 안의 줄바꿈과 연속 공백은 공백 하나로 합친다.
 * 문단의 내용은 판단하지 않는다. 설명은 자유 텍스트라 수상 내역 같은 정보가 구분되어 있지 않다.
 */
export function toDescriptionParagraphs(
  raw: string | null | undefined,
): string[] | undefined {
  if (!raw) return undefined;
  const paragraphs = raw
    .replace(/\r\n?/g, '\n')
    .split(/\n[ \t ]*\n/)
    .map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  return paragraphs.length ? paragraphs : undefined;
}

/**
 * 문단을 말풍선 하나씩 들려줄 문장으로 나눈다.
 * 문장 부호 뒤에 공백이 올 때만 끊어 「12.5%」 같은 숫자는 나누지 않는다.
 */
export function toSentences(paragraph: string): string[] {
  return paragraph
    .split(/(?<=[.!?。])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

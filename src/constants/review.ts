// 리뷰 관련 상수
export const TAGS_LIMIT = 15;
export const TAG_MAX_LENGTH = 12;

// 태그 검증 함수: 영문, 한글, 공백만 허용
export function validateTagText(text: string): boolean {
  const regex = /^[a-zA-Z가-힣\s]+$/;
  return regex.test(text);
}

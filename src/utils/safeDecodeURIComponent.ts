/**
 * decodeURIComponent를 안전하게 실행합니다.
 * 잘못된 인코딩 문자열(예: "50% 할인")에서 URIError가 발생할 경우 원본 값을 반환합니다.
 */
export const safeDecodeURIComponent = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

// 콘텐츠 최대 너비(--content-max-width 768px)에 맞춘 next/image sizes 값.
// 너비를 바꾸면 globals.css와 함께 바꾼다.
export const CONTENT_FULL_IMAGE_SIZES = '(max-width: 768px) 100vw, 768px';

// 좌우 20px 여백 안에 놓이는 카드 이미지
export const CONTENT_INSET_IMAGE_SIZES =
  '(max-width: 768px) calc(100vw - 40px), 728px';

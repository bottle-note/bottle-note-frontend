export const SITE_NAME = 'Bottle Note';

export const SITE_TITLE_TEMPLATE = `%s | ${SITE_NAME}`;

/**
 * 하위 페이지가 있는 layout의 title.
 * 문자열 title을 쓰면 하위 페이지에 상위 template이 이어지지 않아 사이트명이 빠진다.
 * default에는 상위 template이 적용되므로 사이트명을 붙이지 않는다.
 */
export function sectionTitle(title: string) {
  return { default: title, template: SITE_TITLE_TEMPLATE };
}

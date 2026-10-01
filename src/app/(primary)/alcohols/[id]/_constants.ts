/**
 * FLAVOR TAG처럼 "아이바로우 제목 + 콘텐츠"로 구성된 보조 섹션들의
 * 제목-콘텐츠 간격. FlavorTags가 이미 space-y-10으로 이 값을 쓰고 있어서,
 * 새로 추가하는 섹션도 매직 넘버 대신 이 상수를 참조해 10px로 맞춘다.
 */
export const SECTION_HEADING_GAP_CLASS = 'mt-10';

/**
 * 게스트에게 가려지는 상세 정보 영역. 로그인 제한 콘텐츠 구조화 데이터(JSON-LD)의
 * cssSelector가 이 클래스를 가리키므로 이름을 바꾸면 두 곳을 함께 바꾼다.
 */
export const GUEST_GATED_CONTENT_CLASS = 'guest-gated-content';

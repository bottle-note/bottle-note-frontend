// ============================================
// API 에러 메시지 상수
// ============================================

export const ERROR_MESSAGES = {
  // 공통
  FETCH_FAILED: '데이터를 불러오는데 실패했습니다.',
  CREATE_FAILED: '생성에 실패했습니다.',
  UPDATE_FAILED: '수정에 실패했습니다.',
  DELETE_FAILED: '삭제에 실패했습니다.',
  NETWORK_ERROR: '네트워크 오류가 발생했습니다.',

  // 인증
  AUTH_REQUIRED: '로그인이 필요합니다.',
  TOKEN_EXPIRED: '인증이 만료되었습니다. 다시 로그인해주세요.',
  TOKEN_REFRESH_FAILED: '토큰 갱신에 실패했습니다.',

  // 위스키
  ALCOHOL_FETCH_FAILED: '위스키 정보를 불러오는데 실패했습니다.',
  ALCOHOL_LIST_FETCH_FAILED: '위스키 목록을 불러오는데 실패했습니다.',

  // 리뷰
  REVIEW_FETCH_FAILED: '리뷰를 불러오는데 실패했습니다.',
  REVIEW_CREATE_FAILED: '리뷰 등록에 실패했습니다.',
  REVIEW_UPDATE_FAILED: '리뷰 수정에 실패했습니다.',
  REVIEW_DELETE_FAILED: '리뷰 삭제에 실패했습니다.',

  // 댓글
  REPLY_FETCH_FAILED: '댓글을 불러오는데 실패했습니다.',
  REPLY_CREATE_FAILED: '댓글 등록에 실패했습니다.',
  REPLY_UPDATE_FAILED: '댓글 수정에 실패했습니다.',
  REPLY_DELETE_FAILED: '댓글 삭제에 실패했습니다.',

  // 사용자
  USER_FETCH_FAILED: '사용자 정보를 불러오는데 실패했습니다.',
  USER_UPDATE_FAILED: '사용자 정보 수정에 실패했습니다.',

  // 팔로우
  FOLLOW_FAILED: '팔로우에 실패했습니다.',
  UNFOLLOW_FAILED: '언팔로우에 실패했습니다.',

  // 차단
  BLOCK_FAILED: '차단에 실패했습니다.',
  UNBLOCK_FAILED: '차단 해제에 실패했습니다.',

  // 평점
  RATE_FETCH_FAILED: '평점 정보를 불러오는데 실패했습니다.',
  RATE_CREATE_FAILED: '평점 등록에 실패했습니다.',

  // 마이보틀
  MY_BOTTLE_FETCH_FAILED: '마이보틀 정보를 불러오는데 실패했습니다.',

  // 히스토리
  HISTORY_FETCH_FAILED: '기록을 불러오는데 실패했습니다.',

  // 문의
  INQUIRE_FETCH_FAILED: '문의 내역을 불러오는데 실패했습니다.',
  INQUIRE_CREATE_FAILED: '문의 등록에 실패했습니다.',

  // 신고
  REPORT_CREATE_FAILED: '신고에 실패했습니다.',

  // 배너
  BANNER_FETCH_FAILED: '배너를 불러오는데 실패했습니다.',

  // 큐레이션
  CURATION_FETCH_FAILED: '큐레이션을 불러오는데 실패했습니다.',

  // 탐색
  EXPLORE_FETCH_FAILED: '탐색 결과를 불러오는데 실패했습니다.',

  // 좋아요
  LIKE_FAILED: '좋아요에 실패했습니다.',

  // 픽
  PICK_FAILED: '픽에 실패했습니다.',

  // 태그
  TAG_EXTRACT_FAILED: '태그 추출에 실패했습니다.',

  // S3
  PRESIGNED_URL_FAILED: '이미지 업로드 URL 생성에 실패했습니다.',
} as const;

export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;

export const notificationSettingsCopy = {
  title: '알림 수신 설정',
  description: '내 알림함에 담을 소식을 골라주세요.',
  checkingSession: '로그인 상태를 확인 중입니다.',
  loading: '알림 설정을 불러오는 중입니다.',
  loadError: '알림 설정을 불러오지 못했습니다.',
  retry: '다시 시도',
  empty: '설정할 알림이 없습니다.',
  all: '전체 알림 받기',
  allToggleLabel: '전체 알림 일괄 변경',
  enabledCount: (enabled: number, total: number) => `${enabled}/${total}`,
  groupToggleLabel: (name: string, isOpen: boolean) =>
    `${name} ${isOpen ? '접기' : '펼치기'}`,
  groupSwitchLabel: (name: string) => `${name} 전체 변경`,
  saveError: '알림 설정을 저장하지 못했습니다. 다시 시도해 주세요.',
  itemDescriptions: {
    TASTING_UPDATE: '신청한 시음회의 안내가 바뀌거나 취소됐을 때',
    CONTENT_MODERATE: '내 콘텐츠가 숨김·삭제 처리됐을 때',
    ACCOUNT_STATUS_UPDATE: '내 계정의 이용 상태가 변경됐을 때',
    ALCOHOL_SUBMISSION_REVIEW: '내가 등록 요청한 주류의 검토가 끝났을 때',
  } as Record<string, string>,
};

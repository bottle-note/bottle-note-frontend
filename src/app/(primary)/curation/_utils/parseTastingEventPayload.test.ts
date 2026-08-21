import { formatTastingEventFee } from './parseTastingEventPayload';

describe('WHISKY_TASTING_EVENT 참가비 표시', () => {
  it('가격 미정 상태를 입력된 참가비보다 우선한다', () => {
    expect(formatTastingEventFee(0, true)).toBe('가격 미정');
    expect(formatTastingEventFee(50000, true)).toBe('가격 미정');
  });

  it('가격이 확정된 경우 무료와 유료를 구분한다', () => {
    expect(formatTastingEventFee(0, false)).toBe('무료');
    expect(formatTastingEventFee(50000, null)).toBe('50,000원');
    expect(formatTastingEventFee(50000, false)).toBe('50,000원');
  });
});

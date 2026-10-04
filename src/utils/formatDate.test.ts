import { isBeforeToday } from './formatDate';

describe('시음회 날짜 비교', () => {
  afterEach(() => jest.useRealTimers());

  it('서버와 브라우저의 현지 날짜 대신 한국 날짜로 마감을 판단한다', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-10-04T16:00:00Z'));

    expect(isBeforeToday('2026-10-04')).toBe(true);
    expect(isBeforeToday('2026-10-05')).toBe(false);
  });
});

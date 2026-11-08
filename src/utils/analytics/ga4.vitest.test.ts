import { beforeEach, describe, expect, it, vi } from 'vitest';
import { sendGTMEvent } from '@next/third-parties/google';
import { trackGA4Event } from './ga4';

vi.mock('@next/third-parties/google', () => ({ sendGTMEvent: vi.fn() }));

beforeEach(() => vi.mocked(sendGTMEvent).mockClear());

describe('리뷰 이벤트 유입 경로', () => {
  it.each([
    ['write_review_start', { alcohol_id: '900' }],
    ['write_review_complete', { alcohol_id: '900' }],
    ['write_review_failed', { alcohol_id: '900', failure_type: 'review_save' }],
  ] as const)(
    '%s는 바텐더 다음 일반 리뷰의 이전 경로를 지운다',
    (event, params) => {
      trackGA4Event(event, {
        ...params,
        entry_source: 'bartender_note',
        entry_flow: 'recommend',
      });
      expect(sendGTMEvent).toHaveBeenLastCalledWith({
        event,
        ...params,
        entry_source: 'bartender_note',
        entry_flow: 'recommend',
      });

      trackGA4Event(event, params);
      expect(sendGTMEvent).toHaveBeenLastCalledWith({
        event,
        ...params,
        entry_source: null,
        entry_flow: null,
      });
    },
  );

  it('다른 entry_source는 보존하고 리뷰 유입 경로만 비운다', () => {
    trackGA4Event('write_review_complete', {
      alcohol_id: '900',
      entry_source: 'home',
    });
    expect(sendGTMEvent).toHaveBeenCalledWith({
      event: 'write_review_complete',
      alcohol_id: '900',
      entry_source: 'home',
      entry_flow: null,
    });
  });

  it('리뷰 외 이벤트의 전달 매개변수는 바꾸지 않는다', () => {
    trackGA4Event('login', { method: 'kakao' });
    expect(sendGTMEvent).toHaveBeenCalledWith({
      event: 'login',
      method: 'kakao',
    });
  });
});

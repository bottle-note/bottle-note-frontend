import { beforeEach, describe, expect, it } from 'vitest';
import {
  appendScreen,
  classifyEntrySource,
  findPreviousScreen,
  getAlcoholDetailEntrySource,
  recordScreen,
} from './screenHistory';

beforeEach(() => sessionStorage.clear());

describe('술 상세 entry_source 분류', () => {
  it.each([
    [null, 'external'],
    ['/', 'home'],
    ['/explore?tab=EXPLORER_WHISKEY&keyword=%EB%B0%94', 'search'],
    ['/explore', 'explore_review'],
    ['/explore?tab=REVIEW_WHISKEY', 'explore_review'],
    ['/alcohols/12', 'similar'],
    ['/alcohols/12/reviews', 'alcohol_reviews'],
    ['/review/55', 'review'],
    ['/review/register?alcoholId=3', 'review'],
    ['/curation/4', 'curation'],
    ['/bartender-note', 'bartender_note'],
    ['/import-clearance/alcohol/8', 'import_clearance'],
    ['/user/1/my-bottle?type=picks', 'my_bottle'],
    ['/user/1', 'profile'],
    ['/history', 'history'],
    ['/whiskey-tarot', 'whiskey_test'],
    ['/whiskey-mbti/result', 'whiskey_test'],
    ['/notifications', 'other'],
  ] as const)('%s → %s', (previous, expected) => {
    expect(classifyEntrySource(previous)).toBe(expected);
  });
});

describe('직전 화면 기록', () => {
  it('로그인 화면과 같은 주소의 반복은 기록하지 않는다', () => {
    const history = ['/', '/login', '/oauth/kakao', '/agreements', '/'].reduce(
      appendScreen,
      [] as string[],
    );
    expect(history).toEqual(['/']);
  });

  it('로그인 왕복 뒤 같은 상세로 돌아와도 상세 전의 화면을 진입 위치로 본다', () => {
    [
      '/curation/4',
      '/alcohols/9',
      '/login',
      '/oauth/kakao',
      '/alcohols/9',
    ].forEach(recordScreen);
    expect(getAlcoholDetailEntrySource('/alcohols/9')).toBe('curation');
  });

  it('상세 기록 전에 조회해도 직전 화면을 찾는다', () => {
    expect(findPreviousScreen(['/'], '/alcohols/9')).toBe('/');
  });

  it('기록이 없으면 external이다', () => {
    recordScreen('/alcohols/9');
    expect(getAlcoholDetailEntrySource('/alcohols/9')).toBe('external');
  });
});

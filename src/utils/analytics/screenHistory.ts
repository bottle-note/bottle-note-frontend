import type { AlcoholDetailEntrySource } from '@/utils/analytics/types';

const SCREEN_HISTORY_KEY = 'bn_screen_history';
const SCREEN_HISTORY_LIMIT = 5;

// 로그인 왕복은 화면 이동이 아니므로 직전 화면으로 남기지 않는다.
const isAuthFlowPath = (pathname: string) =>
  pathname === '/login' ||
  pathname.startsWith('/oauth/') ||
  pathname === '/agreements';

const pathnameOf = (url: string) => url.split('?')[0];

function readScreenHistory(): string[] {
  try {
    const stored = JSON.parse(
      sessionStorage.getItem(SCREEN_HISTORY_KEY) ?? '[]',
    );
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

export function appendScreen(history: string[], url: string) {
  if (isAuthFlowPath(pathnameOf(url)) || history.at(-1) === url) return history;
  return [...history, url].slice(-SCREEN_HISTORY_LIMIT);
}

export function recordScreen(url: string) {
  try {
    const history = appendScreen(readScreenHistory(), url);
    sessionStorage.setItem(SCREEN_HISTORY_KEY, JSON.stringify(history));
  } catch {
    // 저장소를 쓸 수 없으면 진입 위치를 external로 본다.
  }
}

export function findPreviousScreen(history: string[], currentPathname: string) {
  return (
    [...history].reverse().find((url) => pathnameOf(url) !== currentPathname) ??
    null
  );
}

const ENTRY_SOURCE_BY_PATH: [RegExp, AlcoholDetailEntrySource][] = [
  [/^\/$/, 'home'],
  [/^\/alcohols\/[^/]+\/reviews$/, 'alcohol_reviews'],
  [/^\/alcohols\/[^/]+$/, 'similar'],
  [/^\/review(\/|$)/, 'review'],
  [/^\/curation(\/|$)/, 'curation'],
  [/^\/bartender-note(\/|$)/, 'bartender_note'],
  [/^\/import-clearance(\/|$)/, 'import_clearance'],
  [/^\/user\/[^/]+\/my-bottle$/, 'my_bottle'],
  [/^\/user\/[^/]+$/, 'profile'],
  [/^\/history$/, 'history'],
  [/^\/whiskey-(tarot|mbti)(\/|$)/, 'whiskey_test'],
];

// 둘러보기는 탭이 없으면 리뷰 탭이 기본이다.
const classifyExplore = (search: string): AlcoholDetailEntrySource =>
  new URLSearchParams(search).get('tab') === 'EXPLORER_WHISKEY'
    ? 'search'
    : 'explore_review';

export function classifyEntrySource(
  previousUrl: string | null,
): AlcoholDetailEntrySource {
  if (!previousUrl) return 'external';
  const [pathname, search = ''] = previousUrl.split('?');
  if (pathname === '/explore') return classifyExplore(search);
  const match = ENTRY_SOURCE_BY_PATH.find(([pattern]) =>
    pattern.test(pathname),
  );
  return match?.[1] ?? 'other';
}

export function getAlcoholDetailEntrySource(currentPathname: string) {
  return classifyEntrySource(
    findPreviousScreen(readScreenHistory(), currentPathname),
  );
}

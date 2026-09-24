/** 로그인 기록을 건너뛸 때 브라우저의 이동 방향을 유지한다. */
const ENTRY_KEY = '__bottleNoteHistoryIndex';
const CURRENT_KEY = 'bn_history_index';

let lastIndex: number | null = null;
let direction: 'back' | 'forward' | null = null;

export function trackLoginHistory() {
  const previousIndex = Number(sessionStorage.getItem(CURRENT_KEY)) || 0;
  const entryIndex = window.history.state?.[ENTRY_KEY] as number | undefined;

  // popstate 이후 React 렌더링이나 bfcache 복원으로 중복 호출될 수 있다.
  if (entryIndex === lastIndex && entryIndex === previousIndex) return;

  direction =
    entryIndex === undefined || entryIndex === previousIndex
      ? null
      : entryIndex < previousIndex
        ? 'back'
        : 'forward';

  const index = entryIndex ?? previousIndex + 1;
  lastIndex = index;
  sessionStorage.setItem(CURRENT_KEY, String(index));
  if (entryIndex === undefined) {
    window.history.replaceState(
      { ...window.history.state, [ENTRY_KEY]: index },
      '',
    );
  }
}

export function getLoginHistoryDirection() {
  return direction;
}

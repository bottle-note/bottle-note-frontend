export const REVIEW_EXPLORE_TAB_ID = 'REVIEW_WHISKEY';
export const WHISKEY_EXPLORE_TAB_ID = 'EXPLORER_WHISKEY';

export type ExploreTabId =
  | typeof REVIEW_EXPLORE_TAB_ID
  | typeof WHISKEY_EXPLORE_TAB_ID;

export const DEFAULT_EXPLORE_TAB_ID = REVIEW_EXPLORE_TAB_ID;

export const parseExploreTabId = (tabId: string | null): ExploreTabId =>
  tabId === WHISKEY_EXPLORE_TAB_ID
    ? WHISKEY_EXPLORE_TAB_ID
    : DEFAULT_EXPLORE_TAB_ID;

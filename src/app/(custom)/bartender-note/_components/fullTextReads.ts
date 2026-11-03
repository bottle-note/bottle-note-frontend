/**
 * 전체 글을 열어 본 술 id. 같은 탭에서 그 술에 다시 오면 전체 글을 펼쳐 둔다.
 * 글 자체는 남기지 않는다. 펼칠 글은 그때 받은 술 설명으로 다시 그린다.
 */
const STORAGE_KEY = 'bartender-note:full-text-read:v1';

export function loadFullTextReads(): number[] {
  try {
    const saved = window.sessionStorage.getItem(STORAGE_KEY);
    const ids: unknown = saved ? JSON.parse(saved) : [];
    return Array.isArray(ids)
      ? ids.filter((id): id is number => typeof id === 'number')
      : [];
  } catch {
    // 저장소를 쓸 수 없으면 처음 보는 이야기처럼 접어 둔다
    return [];
  }
}

export function saveFullTextReads(ids: number[]) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // 저장하지 못해도 지금 화면에서는 그대로 읽을 수 있다
  }
}

/**
 * 이야기를 끝까지 들은 술 id. 같은 탭에서 그 술에 다시 오면 나눈 대화를 한 번에 펼쳐 둔다.
 * 문장은 남기지 않는다. 그때 받은 술 설명으로 다시 만든다.
 */
const STORAGE_KEY = 'bartender-note:story-heard:v1';

export function loadHeardStories(): number[] {
  try {
    const saved = window.sessionStorage.getItem(STORAGE_KEY);
    const ids: unknown = saved ? JSON.parse(saved) : [];
    return Array.isArray(ids)
      ? ids.filter((id): id is number => typeof id === 'number')
      : [];
  } catch {
    // 저장소를 쓸 수 없으면 처음 보는 이야기처럼 다시 묻는다
    return [];
  }
}

export function saveHeardStories(ids: number[]) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // 저장하지 못해도 지금 화면에서는 그대로 이어진다
  }
}

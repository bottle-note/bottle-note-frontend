import { sendGTMEvent } from '@next/third-parties/google';
import type { AuthStatus, ClientSession } from '@/lib/auth/session-store';

interface AuthSnapshot {
  status: AuthStatus;
  session: ClientSession | null;
}

// undefined는 아직 확정 전, null은 비회원이다.
let reportedUserId: string | null | undefined;

export function getUserIdForAnalytics(snapshot: AuthSnapshot) {
  if (snapshot.status === 'loading') return undefined;
  const userId = snapshot.session?.user.userId;
  return snapshot.status === 'authenticated' && userId != null
    ? String(userId)
    : null;
}

// GTM 기본 Google 태그가 구성 매개변수 user_id로 읽는 데이터 영역 값을 바꾼다.
export function reportAuthSnapshot(snapshot: AuthSnapshot) {
  const userId = getUserIdForAnalytics(snapshot);
  if (typeof window === 'undefined' || userId === undefined) return;
  if (reportedUserId === userId) return;
  reportedUserId = userId;
  sendGTMEvent({ event: 'auth_state', user_id: userId });
}

export function resetAuthStateReportForTest() {
  reportedUserId = undefined;
}

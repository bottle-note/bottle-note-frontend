import { sendGTMEvent } from '@next/third-parties/google';
import type { AuthStatus, ClientSession } from '@/lib/auth/session-store';

// GTM 기본 Google 태그는 auth_state 이후 실행되므로, 세션 확인이 늦어도 첫 page_view가 이보다 늦어지지 않게 한다.
export const AUTH_STATE_FALLBACK_MS = 3000;

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

export function reportAuthState(userId: string | null) {
  if (typeof window === 'undefined' || reportedUserId === userId) return;
  reportedUserId = userId;
  sendGTMEvent({ event: 'auth_state', user_id: userId });
}

export function reportAuthSnapshot(snapshot: AuthSnapshot) {
  const userId = getUserIdForAnalytics(snapshot);
  if (userId !== undefined) reportAuthState(userId);
}

export function reportGuestIfUnconfirmed() {
  if (reportedUserId === undefined) reportAuthState(null);
}

export function resetAuthStateReportForTest() {
  reportedUserId = undefined;
}

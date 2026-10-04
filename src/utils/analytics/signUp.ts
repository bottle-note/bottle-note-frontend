import { trackGA4Event } from '@/utils/analytics/ga4';
import type { LoginMethod, LoginTrigger } from '@/utils/analytics/types';

const PENDING_SIGN_UP_KEY = 'bn_pending_sign_up';
const SENT_SIGN_UP_USER_KEY = 'bn_sent_sign_up_user';

interface PendingSignUp {
  userId: number;
  method: LoginMethod;
  trigger?: LoginTrigger;
}

export const stageSignUp = (pending: PendingSignUp | null): void => {
  if (typeof window === 'undefined') return;

  if (pending) {
    sessionStorage.setItem(PENDING_SIGN_UP_KEY, JSON.stringify(pending));
  } else {
    sessionStorage.removeItem(PENDING_SIGN_UP_KEY);
  }
};

export const completePendingSignUp = (userId: number): void => {
  if (typeof window === 'undefined') return;

  const stored = sessionStorage.getItem(PENDING_SIGN_UP_KEY);
  if (!stored) return;

  let pending: PendingSignUp;
  try {
    pending = JSON.parse(stored) as PendingSignUp;
  } catch {
    sessionStorage.removeItem(PENDING_SIGN_UP_KEY);
    return;
  }

  if (pending.userId !== userId) return;

  if (sessionStorage.getItem(SENT_SIGN_UP_USER_KEY) !== String(userId)) {
    trackGA4Event('sign_up', {
      method: pending.method,
      trigger: pending.trigger,
    });
    sessionStorage.setItem(SENT_SIGN_UP_USER_KEY, String(userId));
  }

  sessionStorage.removeItem(PENDING_SIGN_UP_KEY);
};

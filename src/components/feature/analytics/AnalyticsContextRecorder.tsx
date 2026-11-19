'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  getAuthSnapshot,
  subscribeAuthSession,
} from '@/lib/auth/session-store';
import {
  AUTH_STATE_FALLBACK_MS,
  reportAuthSnapshot,
  reportGuestIfUnconfirmed,
} from '@/utils/analytics/authState';
import { recordScreen } from '@/utils/analytics/screenHistory';

// 로그인 직후의 login·sign_up에도 회원 번호가 붙도록 React 렌더를 기다리지 않고 세션 변경을 바로 전달한다.
function useAuthStateReport() {
  useEffect(() => {
    const reportCurrent = () => reportAuthSnapshot(getAuthSnapshot());
    reportCurrent();
    const unsubscribe = subscribeAuthSession(reportCurrent);
    const fallback = window.setTimeout(
      reportGuestIfUnconfirmed,
      AUTH_STATE_FALLBACK_MS,
    );
    return () => {
      unsubscribe();
      window.clearTimeout(fallback);
    };
  }, []);
}

function useScreenHistoryRecord() {
  const pathname = usePathname();
  const search = useSearchParams().toString();

  useEffect(() => {
    recordScreen(search ? `${pathname}?${search}` : pathname);
  }, [pathname, search]);
}

export function AnalyticsContextRecorder() {
  useAuthStateReport();
  useScreenHistoryRecord();
  return null;
}

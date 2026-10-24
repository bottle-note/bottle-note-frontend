'use client';

import { useEffect, useRef } from 'react';
import { trackGA4Event } from '@/utils/analytics/ga4';
import type { LoginGatePage } from '@/utils/analytics/types';

interface LoginGateTrackingOptions {
  // 인증 상태가 확정되어 게스트에게 게이트가 보일 때만 true
  enabled?: boolean;
  onReach?: () => void;
}

/**
 * 게스트 로그인 게이트의 진입 → 도달 → 클릭 퍼널을 게이트 마운트당 1회씩 보낸다.
 * 반환한 ref는 게이트 위치를 나타내는 요소에 연결하고, trackClick은 로그인
 * CTA 클릭 핸들러에서 이동 전에 호출한다.
 */
export function useLoginGateTracking<T extends Element = HTMLDivElement>(
  gatePage: LoginGatePage,
  { enabled = true, onReach }: LoginGateTrackingOptions = {},
) {
  const targetRef = useRef<T>(null);
  const viewedAt = useRef<number | null>(null);
  const hasReached = useRef(false);
  const onReachRef = useRef(onReach);
  onReachRef.current = onReach;

  const getSecondsSinceView = () =>
    viewedAt.current === null
      ? 0
      : Math.round((performance.now() - viewedAt.current) / 1000);

  useEffect(() => {
    if (!enabled || viewedAt.current !== null) return;

    viewedAt.current = performance.now();
    trackGA4Event('login_gate_page_view', { gate_page: gatePage });
  }, [enabled, gatePage]);

  useEffect(() => {
    const target = targetRef.current;
    if (!enabled || !target || hasReached.current) return;

    // 관찰 시작 직후의 첫 콜백에서 이미 보이면 스크롤 없이 노출된 게이트다.
    let isInitialCheck = true;
    const observer = new IntersectionObserver(([entry]) => {
      const scrolledToReach = !isInitialCheck;
      isInitialCheck = false;
      if (!entry.isIntersecting || hasReached.current) return;

      hasReached.current = true;
      observer.disconnect();
      trackGA4Event('login_gate_reach', {
        gate_page: gatePage,
        scrolled_to_reach: scrolledToReach,
        seconds_since_view: getSecondsSinceView(),
      });
      onReachRef.current?.();
    });

    observer.observe(target);

    return () => observer.disconnect();
    // getSecondsSinceView는 ref만 읽는다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, gatePage]);

  const trackClick = () => {
    trackGA4Event('login_gate_click', {
      gate_page: gatePage,
      seconds_since_view: getSecondsSinceView(),
    });
  };

  return { ref: targetRef, trackClick };
}

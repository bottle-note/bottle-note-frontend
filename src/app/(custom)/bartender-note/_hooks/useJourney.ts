'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Screen } from '../_lib/experience';

interface Visit {
  screen: Screen;
  scroll: number;
}

/** Keep native browser/WebView back in sync with the conversation's own back. */
export function useJourney() {
  const [screen, setScreen] = useState<Screen>({ step: 'intro' });
  const [backward, setBackward] = useState(false);
  const visits = useRef<Visit[]>([{ screen: { step: 'intro' }, scroll: 0 }]);
  const index = useRef(0);
  const key = useRef('');
  const pending = useRef(false);
  const mounted = useRef(false);
  const completedSessions = useRef(new Set<number>());

  useEffect(() => {
    mounted.current = true;
    key.current = crypto.randomUUID();
    window.history.replaceState(
      { ...window.history.state, bartender: { key: key.current, index: 0 } },
      '',
    );
    const pop = (event: PopStateEvent) => {
      const entry = event.state?.bartender;
      if (entry?.key !== key.current || !visits.current[entry.index]) return;
      const visit = visits.current[entry.index];
      const next = visit.screen;
      // A completed record cannot be submitted again by revisiting an old step.
      if (
        next.reviewSession &&
        completedSessions.current.has(next.reviewSession) &&
        next.step.startsWith('review-')
      ) {
        // Return to the start instead of reopening a completed or newer draft.
        visit.screen = { step: 'review-search' };
      }
      setBackward(entry.index < index.current);
      index.current = entry.index;
      pending.current = false;
      setScreen(visit.screen);
      requestAnimationFrame(() => {
        if (mounted.current)
          window.scrollTo({ top: visit.scroll, behavior: 'instant' });
      });
    };
    window.addEventListener('popstate', pop);
    return () => {
      mounted.current = false;
      window.removeEventListener('popstate', pop);
    };
  }, []);

  const go = useCallback((next: Screen) => {
    if (pending.current) return;
    pending.current = true;
    visits.current[index.current].scroll = window.scrollY;
    visits.current = visits.current.slice(0, index.current + 1);
    visits.current.push({ screen: next, scroll: 0 });
    index.current += 1;
    window.history.pushState(
      {
        ...window.history.state,
        bartender: { key: key.current, index: index.current },
      },
      '',
    );
    setBackward(false);
    setScreen(next);
    window.scrollTo({ top: 0, behavior: 'instant' });
    requestAnimationFrame(() => {
      pending.current = false;
    });
  }, []);

  const back = useCallback(() => {
    if (pending.current || index.current === 0) return;
    pending.current = true;
    window.history.back();
  }, []);

  const home = useCallback(() => {
    if (index.current > 0 && !pending.current) {
      pending.current = true;
      window.history.go(-index.current);
    }
  }, []);

  const finishReview = useCallback(
    (session: number) => completedSessions.current.add(session),
    [],
  );
  return { screen, backward, go, back, home, finishReview };
}

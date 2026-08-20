'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import type { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const STACK_TRANSITION_TIMEOUT_MS = 2000;
const WHISKEY_DETAIL_PATH = /^\/search\/all\/[^/]+\/?$/;

type StackTransitionDirection = 'push' | 'pop';

type ViewTransitionHandle = {
  finished: Promise<void>;
  skipTransition: () => void;
};

type ViewTransitionDocument = Document & {
  startViewTransition?: (
    updateCallback: () => void | Promise<void>,
  ) => ViewTransitionHandle;
};

type PendingTransition = {
  id: number;
  fromPathname: string;
  finishUpdate: () => void;
};

type ExploreScrollSnapshot = {
  href: string;
  scrollY: number;
};

type StackHistoryEntry = {
  detailPathname: string;
  exploreHref: string;
};

interface StackTransitionContextValue {
  canPush: (href: string) => boolean;
  push: (href: string, options?: { scroll?: boolean }) => void;
}

const StackTransitionContext =
  createContext<StackTransitionContextValue | null>(null);

const isExplorePath = (pathname: string) => pathname === '/explore';
const isWhiskeyDetailPath = (pathname: string) =>
  WHISKEY_DETAIL_PATH.test(pathname);

const canUseViewTransition = () => {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return false;
  }

  const viewTransitionDocument = document as ViewTransitionDocument;
  return (
    typeof viewTransitionDocument.startViewTransition === 'function' &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
};

const getPathname = (href: string) => {
  try {
    return new URL(href, window.location.href).pathname;
  } catch {
    return href;
  }
};

export const useStackTransition = () => useContext(StackTransitionContext);

export default function StackTransitionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const pathnameRef = useRef(pathname);
  const pendingTransitionRef = useRef<PendingTransition | null>(null);
  const exploreScrollSnapshotRef = useRef<ExploreScrollSnapshot | null>(null);
  const stackHistoryEntryRef = useRef<StackHistoryEntry | null>(null);
  const transitionSequenceRef = useRef(0);

  const beginTransition = useCallback(
    (direction: StackTransitionDirection, navigate: () => void) => {
      const viewTransitionDocument = document as ViewTransitionDocument;
      const startViewTransition =
        viewTransitionDocument.startViewTransition?.bind(document);

      if (
        !canUseViewTransition() ||
        !startViewTransition ||
        pendingTransitionRef.current
      ) {
        navigate();
        return;
      }

      let isUpdateFinished = false;
      let resolveUpdate: () => void = () => undefined;
      let timeoutId: number | undefined;
      let transition: ViewTransitionHandle | null = null;
      const transitionId = transitionSequenceRef.current + 1;
      transitionSequenceRef.current = transitionId;
      const updateComplete = new Promise<void>((resolve) => {
        resolveUpdate = resolve;
      });

      const finishUpdate = () => {
        if (isUpdateFinished) return;

        isUpdateFinished = true;
        if (timeoutId !== undefined) window.clearTimeout(timeoutId);
        if (pendingTransitionRef.current?.id === transitionId) {
          pendingTransitionRef.current = null;
        }
        resolveUpdate();
      };

      timeoutId = window.setTimeout(() => {
        transition?.skipTransition();
        finishUpdate();
      }, STACK_TRANSITION_TIMEOUT_MS);

      pendingTransitionRef.current = {
        id: transitionId,
        fromPathname: pathnameRef.current,
        finishUpdate,
      };
      document.documentElement.dataset.stackTransition = direction;
      document.documentElement.dataset.stackTransitionId = String(transitionId);

      try {
        transition = startViewTransition(() => {
          navigate();
          return updateComplete;
        });

        void transition.finished
          .catch(() => undefined)
          .finally(() => {
            finishUpdate();
            if (
              document.documentElement.dataset.stackTransitionId ===
              String(transitionId)
            ) {
              delete document.documentElement.dataset.stackTransition;
              delete document.documentElement.dataset.stackTransitionId;
            }
          });
      } catch {
        finishUpdate();
        if (
          document.documentElement.dataset.stackTransitionId ===
          String(transitionId)
        ) {
          delete document.documentElement.dataset.stackTransition;
          delete document.documentElement.dataset.stackTransitionId;
        }
        navigate();
      }
    },
    [],
  );

  useLayoutEffect(() => {
    pathnameRef.current = pathname;

    const scrollSnapshot = exploreScrollSnapshotRef.current;
    if (
      isExplorePath(pathname) &&
      scrollSnapshot?.href === window.location.pathname + window.location.search
    ) {
      window.scrollTo(0, scrollSnapshot.scrollY);
      exploreScrollSnapshotRef.current = null;
      stackHistoryEntryRef.current = null;
    } else {
      const stackHistoryEntry = stackHistoryEntryRef.current;
      if (
        stackHistoryEntry &&
        pathname !== stackHistoryEntry.detailPathname &&
        !isExplorePath(pathname)
      ) {
        stackHistoryEntryRef.current = null;
        exploreScrollSnapshotRef.current = null;
      }
    }

    const pendingTransition = pendingTransitionRef.current;
    if (pendingTransition && pendingTransition.fromPathname !== pathname) {
      pendingTransition.finishUpdate();
    }
  }, [pathname]);

  useEffect(() => {
    const handlePopState = () => {
      const fromPathname = pathnameRef.current;
      const toPathname = window.location.pathname;
      const toHref = toPathname + window.location.search;
      const stackHistoryEntry = stackHistoryEntryRef.current;

      if (
        canUseViewTransition() &&
        stackHistoryEntry?.detailPathname === fromPathname &&
        stackHistoryEntry.exploreHref === toHref &&
        isWhiskeyDetailPath(fromPathname) &&
        isExplorePath(toPathname)
      ) {
        beginTransition('pop', () => undefined);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [beginTransition]);

  useEffect(
    () => () => {
      pendingTransitionRef.current?.finishUpdate();
      delete document.documentElement.dataset.stackTransition;
      delete document.documentElement.dataset.stackTransitionId;
    },
    [],
  );

  const value = useMemo<StackTransitionContextValue>(
    () => ({
      canPush: (href) =>
        isExplorePath(pathnameRef.current) &&
        isWhiskeyDetailPath(getPathname(href)),
      push: (href, options) => {
        const exploreHref = window.location.pathname + window.location.search;
        exploreScrollSnapshotRef.current = {
          href: exploreHref,
          scrollY: window.scrollY,
        };
        stackHistoryEntryRef.current = {
          detailPathname: getPathname(href),
          exploreHref,
        };
        beginTransition('push', () => router.push(href, options));
      },
    }),
    [beginTransition, router],
  );

  return (
    <StackTransitionContext.Provider value={value}>
      {children}
    </StackTransitionContext.Provider>
  );
}

import { useRef, useCallback, useEffect } from 'react';

type DebounceAction = () => Promise<void> | void;

interface UseDebounceActionOptions {
  flushOnUnmount?: boolean;
}

const useDebounceAction = (
  delay: number = 2000,
  { flushOnUnmount = false }: UseDebounceActionOptions = {},
) => {
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingActionRef = useRef<DebounceAction | null>(null);

  const executePendingAction = useCallback(async () => {
    const action = pendingActionRef.current;
    pendingActionRef.current = null;

    if (!action) return;

    try {
      await action();
    } catch (error) {
      console.error('Debounced action error:', error);
    }
  }, []);

  const debounce = useCallback(
    (action: DebounceAction) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      pendingActionRef.current = action;
      debounceTimerRef.current = setTimeout(() => {
        debounceTimerRef.current = null;
        void executePendingAction();
      }, delay);
    },
    [delay, executePendingAction],
  );

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      if (flushOnUnmount) {
        void executePendingAction();
      } else {
        pendingActionRef.current = null;
      }
    };
  }, [executePendingAction, flushOnUnmount]);

  const cancel = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    pendingActionRef.current = null;
  }, []);

  return { debounce, cancel };
};

export default useDebounceAction;

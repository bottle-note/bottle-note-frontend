import { useRef, useCallback, useEffect } from 'react';

interface UseDebounceActionOptions {
  cancelOnUnmount?: boolean;
}

const useDebounceAction = (
  delay: number = 2000,
  { cancelOnUnmount = true }: UseDebounceActionOptions = {},
) => {
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const debounce = useCallback(
    (action: () => Promise<void> | void) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(async () => {
        try {
          await action();
        } catch (error) {
          console.error('Debounced action error:', error);
        }
      }, delay);
    },
    [delay],
  );

  useEffect(() => {
    return () => {
      if (cancelOnUnmount && debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [cancelOnUnmount]);

  const cancel = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);

  return { debounce, cancel };
};

export default useDebounceAction;

import { useRef, useCallback, useEffect } from 'react';

const useDebounceAction = (delay: number = 2000) => {
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
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const cancel = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);

  return { debounce, cancel };
};

export default useDebounceAction;

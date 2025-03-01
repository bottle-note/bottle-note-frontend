import { useEffect, RefObject } from 'react';

interface ScrollIntoViewOptions {
  behavior?: ScrollBehavior;
  block?: ScrollLogicalPosition;
  inline?: ScrollLogicalPosition;
}

export function useScrollIntoView<T extends HTMLElement>(
  ref: RefObject<T>,
  options: ScrollIntoViewOptions = {
    behavior: 'smooth',
    block: 'center',
  },
) {
  useEffect(() => {
    const handleFocus = () => {
      if (ref.current) {
        ref.current.scrollIntoView(options);
      }
    };

    const element = ref.current;
    if (element) {
      element.addEventListener('focus', handleFocus);
    }

    return () => {
      if (element) {
        element.removeEventListener('focus', handleFocus);
      }
    };
  }, [ref, options]);
}

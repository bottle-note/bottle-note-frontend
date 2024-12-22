import { useState, useCallback, useRef } from 'react';

export const useToast = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  const timerRef = useRef<NodeJS.Timeout>();

  const showToast = useCallback((text: string, duration = 2000) => {
    setMessage(text);
    setIsVisible(true);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, duration);
  }, []);

  return { isVisible, message, showToast };
};

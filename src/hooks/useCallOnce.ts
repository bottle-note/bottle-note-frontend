import { useState } from 'react';

export const useCallOnce = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const executeApiCall = async (apiCallFunction: () => Promise<void>) => {
    if (isProcessing) {
      return;
    }

    setIsProcessing(true);
    try {
      await apiCallFunction();
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    executeApiCall,
  };
};

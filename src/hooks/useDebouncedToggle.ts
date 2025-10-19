import { useRef, useEffect } from 'react';
import useDebounceAction from '@/hooks/useDebounceAction';
import useModalStore from '@/store/modalStore';
import { DEBOUNCE_DELAY } from '@/constants/common';

interface UseDebouncedToggleParams<T> {
  isToggled: boolean;
  apiCall: (id: T, state: boolean) => Promise<void>;
  id: T;
  onApiSuccess?: () => void;
  onApiError?: () => void;
  errorMessage: string;
}

export const useDebouncedToggle = <T extends string | number>({
  isToggled,
  apiCall,
  id,
  onApiSuccess,
  onApiError,
  errorMessage,
}: UseDebouncedToggleParams<T>) => {
  const { handleModalState } = useModalStore();
  const { debounce } = useDebounceAction(DEBOUNCE_DELAY);

  const lastSyncedStateRef = useRef(isToggled);
  const pendingStateRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (pendingStateRef.current === null) {
      lastSyncedStateRef.current = isToggled;
    }
  }, [isToggled]);

  const handleToggle = async (newState: boolean) => {
    pendingStateRef.current = newState;

    debounce(async () => {
      const stateToSync = pendingStateRef.current;

      if (stateToSync === null || stateToSync === lastSyncedStateRef.current) {
        return;
      }

      try {
        await apiCall(id, stateToSync);
        lastSyncedStateRef.current = stateToSync;
        pendingStateRef.current = null;

        if (onApiSuccess) {
          onApiSuccess();
        }
      } catch (error) {
        console.error('Error updating toggle status:', error);
        pendingStateRef.current = null;

        handleModalState({
          isShowModal: true,
          mainText: errorMessage,
        });

        if (onApiError) {
          onApiError();
        }
      }
    });
  };

  return { handleToggle };
};

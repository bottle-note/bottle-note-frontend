'use client';

import { useEffect, useCallback, useRef } from 'react';
import { Storage } from '@/lib/Storage';
import { ReviewTempData } from '@/types/Review';
import useModalStore from '@/store/modalStore';
import { useToast } from './useToast';

interface Props {
  alcoholId: string;
  onLoad?: (data: ReviewTempData) => void;
  getCurrentData: () => ReviewTempData | null;
  shouldSave?: (data: ReviewTempData | null) => boolean;
}

export const useReviewAutoSave = ({
  alcoholId,
  onLoad,
  getCurrentData,
  shouldSave = () => true,
}: Props) => {
  const STORAGE_KEY_PREFIX = 'review_temp';
  const SAVE_INTERVAL = 60000; // 1분
  const MAX_SAVE_DAYS = 3 * 24 * 60 * 60 * 1000; // 3일

  const { showToast, isVisible, message } = useToast();
  const { handleModalState, handleCloseModal } = useModalStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const getStorageKey = useCallback(
    (id: string) => `${STORAGE_KEY_PREFIX}_${id}`,
    [],
  );

  const saveReview = useCallback(() => {
    const currentData = getCurrentData();
    if (!shouldSave(currentData)) return;

    if (currentData) {
      Storage.setItem(getStorageKey(alcoholId), currentData);
      showToast('임시 저장되었습니다.');
    }
  }, [getCurrentData, getStorageKey, alcoholId, shouldSave, showToast]);

  const loadSavedReview = useCallback(() => {
    const savedData = Storage.getItem<ReviewTempData>(getStorageKey(alcoholId));
    if (!savedData) return null;

    const timeChecking = new Date().getTime() - savedData.timestamp;
    if (timeChecking < MAX_SAVE_DAYS) {
      return savedData;
    }
    Storage.removeItem(getStorageKey(alcoholId));
    return null;
  }, [getStorageKey, alcoholId]);

  const checkSavedReview = useCallback(() => {
    const savedData = Storage.getItem<ReviewTempData>(getStorageKey(alcoholId));
    if (!savedData) return false;

    const timeChecking = new Date().getTime() - savedData.timestamp;

    return timeChecking < MAX_SAVE_DAYS;
  }, [getStorageKey, alcoholId]);

  const removeSavedReview = useCallback(() => {
    Storage.removeItem(getStorageKey(alcoholId));
  }, [getStorageKey, alcoholId]);

  const promptLoadSavedReview = useCallback(async () => {
    if (checkSavedReview()) {
      handleModalState({
        isShowModal: true,
        mainText: '저장된 리뷰 데이터가 있습니다. 불러오시겠습니까?',
        type: 'CONFIRM',
        handleConfirm: () => {
          const savedData = loadSavedReview();
          if (savedData && onLoad) {
            onLoad(savedData);
            handleCloseModal();
          }
        },
        handleCancel: () => {
          removeSavedReview();
          handleCloseModal();
        },
      });
    } else {
      Storage.removeItem(getStorageKey(alcoholId));
      return false;
    }
  }, [checkSavedReview, loadSavedReview, onLoad]);

  useEffect(() => {
    promptLoadSavedReview();
  }, [promptLoadSavedReview]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveReview();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [saveReview]);

  useEffect(() => {
    intervalRef.current = setInterval(saveReview, SAVE_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [saveReview]);

  return {
    saveReview,
    loadSavedReview,
    removeSavedReview,
    checkSavedReview,
    promptLoadSavedReview,
    isToastVisible: isVisible,
    toastMessage: message,
  };
};

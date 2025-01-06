'use client';

import React, { useState, useEffect } from 'react';
import { ReviewApi } from '@/app/api/ReviewApi';
import useModalStore from '@/store/modalStore';
import { AuthService } from '@/lib/AuthService';
import Toggle from './Toggle';

interface Props {
  initialStatus: boolean;
  reviewId: string | number;
  handleNotLogin: () => void;
}

const VisibilityToggle = ({
  reviewId,
  initialStatus,
  handleNotLogin,
}: Props) => {
  const { isLogin } = AuthService;
  const { handleModalState } = useModalStore();
  const [isActive, setIsActive] = useState(initialStatus);

  const handleToggle = async () => {
    if (!isLogin) {
      handleNotLogin();
    } else {
      const newStatus = !isActive;
      setIsActive(newStatus);
      try {
        await ReviewApi.putVisibility(
          reviewId,
          newStatus ? 'PUBLIC' : 'PRIVATE',
        );
        handleModalState({
          isShowModal: true,
          mainText: '리뷰를 비공개했습니다.',
          subText: '비공개 된 리뷰는 나만 볼 수 있어요!',
          type: 'ALERT',
        });
      } catch (error) {
        handleModalState({
          isShowModal: true,
          type: 'ALERT',
          mainText: '공개, 비공개 업데이트에 실패했습니다. 다시 시도해주세요.',
        });
        console.error('Error updating like status:', error);
        setIsActive(!newStatus);
      }
    }
  };

  useEffect(() => {
    setIsActive(initialStatus);
  }, [initialStatus]);

  return (
    <>
      <Toggle isActive={isActive} onToggle={handleToggle} />
    </>
  );
};

export default VisibilityToggle;

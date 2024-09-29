'use client';

import React, { useState } from 'react';
import { ReviewApi } from '@/app/api/ReviewApi';
import useModalStore from '@/store/modalStore';
import { useAuth } from '@/utils/useAuth';
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
  const { isLogin } = useAuth();
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

  return (
    <>
      <Toggle isActive={isActive} onToggle={handleToggle} />
    </>
  );
};

export default VisibilityToggle;

import React, { useState, useEffect } from 'react';
import { ReviewApi } from '@/app/api/ReviewApi';
import useModalStore from '@/store/modalStore';
import { AuthService } from '@/lib/AuthService';
import Toggle from './Toggle';

interface Props {
  initialStatus: boolean;
  reviewId: string | number;
  handleNotLogin: () => void;
  onSuccess: () => void;
  textSize?: string;
}

const VisibilityToggle = ({
  reviewId,
  initialStatus,
  handleNotLogin,
  onSuccess,
  textSize,
}: Props) => {
  const { isLogin } = AuthService;
  const { handleModalState } = useModalStore();
  const [isActive, setIsActive] = useState(initialStatus);

  const handleToggle = async () => {
    if (!isLogin) {
      handleNotLogin();
    } else {
      try {
        const response = await ReviewApi.putVisibility(
          reviewId,
          !isActive ? 'PUBLIC' : 'PRIVATE',
        );

        if (response) {
          handleModalState({
            isShowModal: true,
            mainText: !isActive
              ? '리뷰를 공개했습니다.'
              : '리뷰를 비공개했습니다.',
            subText: !isActive
              ? '공개 된 리뷰는 모두가 볼 수 있어요!'
              : '비공개 된 리뷰는 나만 볼 수 있어요!',
            type: 'ALERT',
          });
          onSuccess();
        }
      } catch (error) {
        handleModalState({
          isShowModal: true,
          type: 'ALERT',
          mainText: `${!isActive ? '공개' : '비공개'}로 변경을 실패했습니다.`,
          subText: '다시 시도해주세요.',
        });
      }
    }
  };

  useEffect(() => {
    setIsActive(initialStatus);
  }, [initialStatus]);

  return (
    <Toggle isActive={isActive} onToggle={handleToggle} textSize={textSize} />
  );
};

export default VisibilityToggle;

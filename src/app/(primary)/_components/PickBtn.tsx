'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import { AlcoholsApi } from '@/app/api/AlcholsApi';
import useModalStore from '@/store/modalStore';
import { AuthService } from '@/lib/AuthService';
import { DEBOUNCE_DELAY } from '@/constants/common';
import useDebounceAction from '@/hooks/useDebounceAction';

interface Props {
  isPicked: boolean;
  handleUpdatePicked: () => void;
  onApiSuccess?: () => void;
  onApiError?: () => void;
  handleNotLogin: () => void;
  pickBtnName?: string;
  iconColor?: 'white' | 'subcoral';
  size?: number;
  alcoholId: number;
  fontSize?: string;
}

const PickBtn = ({
  isPicked,
  handleUpdatePicked,
  onApiSuccess,
  onApiError,
  handleNotLogin,
  alcoholId,
  pickBtnName,
  iconColor = 'white',
  size = 18,
  fontSize = 'text-12',
}: Props) => {
  const { isLogin } = AuthService;
  const { handleModalState } = useModalStore();
  const { debounce } = useDebounceAction(DEBOUNCE_DELAY);

  const lastSyncedPickedRef = useRef(isPicked);
  const pendingPickedRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (pendingPickedRef.current === null) {
      lastSyncedPickedRef.current = isPicked;
    }
  }, [isPicked]);

  const handleClick = async () => {
    if (!isLogin) {
      handleNotLogin();
      return;
    }

    handleUpdatePicked();

    const newPickState = !isPicked;
    pendingPickedRef.current = newPickState;

    debounce(async () => {
      const stateToSync = pendingPickedRef.current;

      if (stateToSync === null || stateToSync === lastSyncedPickedRef.current) {
        return;
      }

      try {
        await AlcoholsApi.putPick(alcoholId, stateToSync);
        lastSyncedPickedRef.current = stateToSync;
        pendingPickedRef.current = null;

        if (onApiSuccess) {
          onApiSuccess();
        }
      } catch (error) {
        console.error('Error updating pick status:', error);

        pendingPickedRef.current = null;

        handleModalState({
          isShowModal: true,
          type: 'ALERT',
          mainText: '찜하기 업데이트에 실패했습니다. 다시 시도해주세요.',
        });

        if (onApiError) {
          onApiError();
        }
      }
    });
  };

  const iconType = isPicked ? 'filled' : 'outlined';
  const iconSrc = `/icon/pick-${iconType}-${iconColor}.svg`;

  return (
    <button
      className={
        pickBtnName
          ? 'flex items-center space-x-[3px]'
          : 'justify-self-end row-start-3'
      }
      onClick={handleClick}
    >
      <Image
        src={iconSrc}
        width={size}
        height={size}
        alt={isPicked ? 'Pick' : 'Unpick'}
      />
      {pickBtnName && (
        <p className={`${fontSize} font-normal`}>{pickBtnName}</p>
      )}
    </button>
  );
};

export default PickBtn;

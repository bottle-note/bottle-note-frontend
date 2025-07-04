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
  handleError?: () => void;
  handleNotLogin: () => void;
  pickBtnName?: string;
  iconColor?: 'white' | 'subcoral';
  size?: number;
  alcoholId: number;
}

const PickBtn = ({
  isPicked,
  handleUpdatePicked,
  handleError,
  handleNotLogin,
  alcoholId,
  pickBtnName,
  iconColor = 'white',
  size = 18,
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
      } catch (error) {
        console.error('Error updating pick status:', error);

        pendingPickedRef.current = null;

        handleModalState({
          isShowModal: true,
          type: 'ALERT',
          mainText: '찜하기 업데이트에 실패했습니다. 다시 시도해주세요.',
        });

        if (handleError) {
          handleError();
        }
      }
    });
  };
  return (
    <button
      className={
        pickBtnName
          ? 'flex items-end space-x-[1px]'
          : 'justify-self-end row-start-3'
      }
      onClick={handleClick}
    >
      {isPicked ? (
        <Image
          src={`/icon/pick-filled-${iconColor}.svg`}
          width={size}
          height={size}
          alt="Pick"
        />
      ) : (
        <Image
          src={`/icon/pick-outlined-${iconColor}.svg`}
          width={size}
          height={size}
          alt="unPick"
        />
      )}
      {pickBtnName && <p className="text-12 font-normal">{pickBtnName}</p>}
    </button>
  );
};

export default PickBtn;

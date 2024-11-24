'use client';

import Image from 'next/image';
import { AlcoholsApi } from '@/app/api/AlcholsApi';
import useModalStore from '@/store/modalStore';
import { AuthService } from '@/lib/AuthService';

interface Props {
  isPicked: boolean;
  handleUpdatePicked: () => void;
  handleError: () => void;
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

  const handleClick = async () => {
    if (!isLogin) {
      handleNotLogin();
    } else {
      handleUpdatePicked();
      try {
        await AlcoholsApi.putPick(alcoholId, !isPicked);
      } catch (error) {
        handleModalState({
          isShowModal: true,
          type: 'ALERT',
          mainText: '찜하기 업데이트에 실패했습니다. 다시 시도해주세요.',
        });
        console.error('Error updating pick status:', error);
        handleError();
      }
    }
  };
  return (
    <button
      className={
        pickBtnName
          ? 'flex items-center space-x-1'
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
      {pickBtnName && <p className="text-12 font-bold">{pickBtnName}</p>}
    </button>
  );
};

export default PickBtn;

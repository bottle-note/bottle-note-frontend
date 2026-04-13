'use client';

import Image from 'next/image';
import { AlcoholsApi } from '@/api/alcohol/alcohol.api';
import { useAuth } from '@/hooks/auth/useAuth';
import { useDebouncedToggle } from '@/hooks/useDebouncedToggle';
import { trackGA4Event } from '@/utils/analytics/ga4';

interface Props {
  isPicked: boolean;
  handleUpdatePicked?: () => void;
  onApiSuccess?: () => void;
  onApiError?: () => void;
  handleNotLogin: () => void;
  pickBtnName?: string;
  iconColor?: 'white' | 'subcoral';
  size?: number;
  alcoholId: number;
  alcoholName?: string;
  fontSize?: string;
}

const AlcoholPickButton = ({
  isPicked,
  handleUpdatePicked,
  onApiSuccess,
  onApiError,
  handleNotLogin,
  alcoholId,
  alcoholName = '',
  pickBtnName,
  iconColor = 'white',
  size = 18,
  fontSize = 'text-12',
}: Props) => {
  const { isLoggedIn } = useAuth();

  const { handleToggle } = useDebouncedToggle({
    isToggled: isPicked,
    apiCall: async ({ id, state }) => {
      await AlcoholsApi.putPick({ alcoholId: id, isPicked: state });
    },
    id: alcoholId,
    onApiSuccess,
    onApiError,
    errorMessage: '찜하기 업데이트에 실패했습니다. 다시 시도해주세요.',
  });

  const handleClick = async () => {
    if (!isLoggedIn) {
      handleNotLogin();
      return;
    }

    if (!handleUpdatePicked) {
      return;
    }

    handleUpdatePicked();
    const newPickState = !isPicked;
    trackGA4Event('add_to_picks', {
      alcohol_id: String(alcoholId),
      alcohol_name: alcoholName,
      action: newPickState ? 'add' : 'remove',
    });
    handleToggle(newPickState);
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

export default AlcoholPickButton;

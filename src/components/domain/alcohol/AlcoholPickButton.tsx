'use client';

import { AlcoholsApi } from '@/api/alcohol/alcohol.api';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import { useDebouncedToggle } from '@/hooks/useDebouncedToggle';
import { trackGA4Event } from '@/utils/analytics/ga4';
import SemanticIcon from '@/components/ui/Display/SemanticIcon';

const PICK_DEBOUNCE_DELAY_MS = 500;

interface Props {
  isPicked: boolean;
  handleUpdatePicked?: () => void;
  onApiSuccess?: () => void;
  onApiError?: () => void;
  handleNotLogin: () => void;
  pickBtnName?: string;
  tone?: 'brand' | 'brandContrast';
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
  tone = 'brandContrast',
  size = 18,
  fontSize = 'text-12',
}: Props) => {
  const { isLoggedIn } = useAuthSession();

  const { handleToggle } = useDebouncedToggle({
    isToggled: isPicked,
    apiCall: async ({ id, state }) => {
      await AlcoholsApi.putPick({ alcoholId: id, isPicked: state });
    },
    id: alcoholId,
    debounceDelay: PICK_DEBOUNCE_DELAY_MS,
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

  return (
    <button
      className={`${tone === 'brand' ? 'text-fg-brand' : 'text-fg-brand-contrast'} ${
        pickBtnName
          ? 'flex items-center space-x-[3px]'
          : 'justify-self-end row-start-3'
      }`}
      onClick={handleClick}
      aria-label={isPicked ? '찜 취소' : '찜하기'}
    >
      <SemanticIcon
        src={`/icon/pick-${iconType}-subcoral.svg`}
        width={size}
        height={size}
      />
      {pickBtnName && (
        <p className={`${fontSize} font-normal`}>{pickBtnName}</p>
      )}
    </button>
  );
};

export default AlcoholPickButton;

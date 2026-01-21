import Image from 'next/image';
import { SORT_ORDER } from '@/api/_shared/types';
import DescendingIcon from 'public/icon/descending-subcoral.svg';
import AscendingIcon from 'public/icon/ascending-subcoral.svg';

interface Props {
  type: SORT_ORDER;
  handleSortOrder: (value: SORT_ORDER) => void;
}

const SortOrderSwitch = ({ type, handleSortOrder }: Props) => {
  if (type === SORT_ORDER.ASC)
    return (
      <button onClick={() => handleSortOrder(SORT_ORDER.DESC)}>
        <Image src={AscendingIcon} alt="오름차순" />
      </button>
    );

  return (
    <button onClick={() => handleSortOrder(SORT_ORDER.ASC)}>
      <Image src={DescendingIcon} alt="내림차순" />
    </button>
  );
};

export default SortOrderSwitch;

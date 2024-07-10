import { SORT_ORDER } from '@/types/common';
import Image from 'next/image';
import DescendingIcon from 'public/icon/descending-subcoral.svg';
import AscendingIcon from 'public/icon/ascending-subcoral.svg';

interface Props {
  type: SORT_ORDER;
  handleSortOrder: (value: SORT_ORDER) => void;
}

const SortOrderToggle = ({ type, handleSortOrder }: Props) => {
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

export default SortOrderToggle;

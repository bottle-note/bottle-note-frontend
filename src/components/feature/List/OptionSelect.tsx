import { useState } from 'react';
import Image from 'next/image';
import OptionDropdown from '@/components/ui/Modal/OptionDropdown';
import ArrowDownIcon from 'public/icon/arrow-down-subcoral.svg';

interface SortOptionProps {
  options: { type: string; name: string }[];
  handleOptionCallback?: (type: string) => void;
  title?: string;
  defaultLabel?: string;
}

const OptionSelect = ({
  options,
  handleOptionCallback,
  title,
  defaultLabel,
}: SortOptionProps) => {
  const [selectedOption, setSelectedOption] = useState(
    defaultLabel || options[0].name,
  );
  const [isDropDownShow, setIsDropDownShow] = useState(false);

  const handleSortOptionsShow = () => {
    setIsDropDownShow((prev) => !prev);
  };

  const handleOptionSelect = ({
    type,
    name,
  }: {
    type: string;
    name: string;
  }) => {
    setSelectedOption(name);
    if (handleOptionCallback) {
      handleOptionCallback(type);
    }
  };

  return (
    <>
      <button
        className="label-default flex items-center gap-1 px-2.5 py-1 rounded-md text-10"
        onClick={handleSortOptionsShow}
      >
        <span>{selectedOption}</span>
        <Image src={ArrowDownIcon} alt="정렬" />
      </button>

      {isDropDownShow && (
        <OptionDropdown
          handleClose={handleSortOptionsShow}
          options={options}
          handleOptionSelect={handleOptionSelect}
          title={title}
        />
      )}
    </>
  );
};

export default OptionSelect;

import { useState } from 'react';
import Image from 'next/image';
import ArrowDownIcon from 'public/icon/arrow-down-subcoral.svg';
import OptionDropdown from '../OptionDropdown';

interface SortOptionProps {
  options: { type: string; name: string }[];
  handleOptionCallback?: (type: string) => void;
  title?: string;
}

const OptionSelect = ({
  options,
  handleOptionCallback,
  title,
}: SortOptionProps) => {
  const [selectedOption, setSelectedOption] = useState(options[0].name);
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
    handleOptionCallback && handleOptionCallback(type);
    setIsDropDownShow(false);
  };

  return (
    <>
      <button
        className="label-default flex items-center gap-1 px-2.5 py-1 rounded-md text-xxs"
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

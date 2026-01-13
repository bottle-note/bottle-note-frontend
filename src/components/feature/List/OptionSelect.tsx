import { useState, useEffect } from 'react';
import Image from 'next/image';
import OptionDropdown from '@/components/ui/Modal/OptionDropdown';
import ArrowDownIcon from 'public/icon/arrow-down-subcoral.svg';

interface SortOptionProps {
  options: { type: string; name: string }[];
  handleOptionCallback?: (type: string) => void;
  title?: string;
  defaultLabel?: string;
  currentValue?: string;
}

const OptionSelect = ({
  options,
  handleOptionCallback,
  title,
  defaultLabel,
  currentValue,
}: SortOptionProps) => {
  const [selectedOption, setSelectedOption] = useState(
    defaultLabel || options[0].name,
  );
  const [isDropDownShow, setIsDropDownShow] = useState(false);

  useEffect(() => {
    if (currentValue) {
      const matchedOption = options.find((opt) => opt.type === currentValue);
      if (matchedOption) {
        setSelectedOption(matchedOption.name);
      }
    }
  }, [currentValue, options]);

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
        <span className="whitespace-nowrap">{selectedOption}</span>
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

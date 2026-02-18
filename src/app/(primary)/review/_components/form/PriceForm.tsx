import React from 'react';
import Image from 'next/image';
import { useFormContext } from 'react-hook-form';
import OptionsContainer from '../OptionsContainer';

interface OptionProps {
  label: string;
  value: 'GLASS' | 'BOTTLE';
}

const options: OptionProps[] = [
  { label: '1잔', value: 'GLASS' },
  { label: '보틀(1병)', value: 'BOTTLE' },
];

export default function PriceForm() {
  const { register, watch, setValue } = useFormContext();

  const getPriceTypeLabel = (priceType: 'BOTTLE' | 'GLASS' | null) => {
    if (priceType === 'BOTTLE') return '1병에';
    if (priceType === 'GLASS') return '1잔에';
    return '';
  };

  const resetPrice = () => {
    setValue('price', '');
    setValue('price_type', null);
  };

  return (
    <OptionsContainer
      iconSrc="/icon/money-subcoral.svg"
      iconAlt="moneyIcon"
      title="가격"
      subTitle="(선택)"
    >
      <div className="w-full pl-7 space-y-4 mt-[6px]">
        <div className="flex items-center space-x-3">
          {options.map((option) => (
            <label
              key={option.value}
              htmlFor={option.value}
              className="flex items-center text-mainDarkGray text-14"
            >
              <input
                type="radio"
                className="h-5 w-5 accent-subCoral mr-1"
                id={option.value}
                value={option.value}
                {...register('price_type')}
                checked={watch('price_type') === option.value}
              />
              {option.label}
            </label>
          ))}
        </div>
        {watch('price_type') && (
          <div className="flex items-center gap-3">
            <div className="h-7 flex-1 min-w-0 border-b border-subCoral flex items-center">
              <span className="text-subCoral text-15 shrink-0 pr-1">
                {getPriceTypeLabel(watch('price_type'))}
              </span>
              <div className="flex-1 min-w-0 relative h-full">
                <input
                  type="number"
                  className="absolute inset-0 w-full h-full text-15 text-mainBlack bg-transparent text-right pr-2 pb-[1.5px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  maxLength={10}
                  {...register('price', {
                    setValueAs: (value) =>
                      value === '' || value === 0 ? null : value,
                  })}
                />
                {!watch('price') && (
                  <span className="absolute inset-0 flex items-center text-15 text-mainGray pointer-events-none truncate">
                    얼마에 마셨는지 기록해보세요!
                  </span>
                )}
              </div>
              <span className="text-subCoral text-15 shrink-0">원</span>
            </div>
            <button
              type="button"
              className="flex items-center gap-[2px] shrink-0"
              onClick={resetPrice}
            >
              <span className="text-14 text-mainGray">초기화</span>
              <Image
                src="/icon/reset-mainGray.svg"
                alt="resetIcon"
                width={16}
                height={16}
              />
            </button>
          </div>
        )}
      </div>
    </OptionsContainer>
  );
}

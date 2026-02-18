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
          <div className="flex items-center justify-between">
            <div className="h-7 w-60 border-b border-subCoral flex items-center">
              <p className="text-subCoral text-15 w-10">
                {getPriceTypeLabel(watch('price_type'))}
              </p>
              <input
                type="number"
                placeholder="얼마에 마셨는지 기록해보세요!"
                className="text-15 w-full text-mainBlack text-right"
                maxLength={10}
                {...register('price', {
                  setValueAs: (value) =>
                    value === '' || value === 0 ? null : value,
                })}
              />{' '}
              <p className="text-subCoral text-15">원</p>
            </div>
            <div
              className="flex items-center space-x-[2px]"
              onClick={resetPrice}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  resetPrice();
                }
              }}
            >
              <p className="text-14 text-mainGray">초기화</p>
              <Image
                src="/icon/reset-mainGray.svg"
                alt="resetIcon"
                width={16}
                height={16}
              />
            </div>
          </div>
        )}
      </div>
    </OptionsContainer>
  );
}

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
      title="이 술의 가격이 얼마인가요?"
      subTitle="(선택)"
    >
      <div className="w-full pl-7 space-y-3">
        <div className="flex items-center space-x-3">
          {options.map((option) => (
            <label
              key={option.value}
              htmlFor={option.value}
              className="flex items-center text-mainDarkGray text-10"
            >
              <input
                type="radio"
                className="mr-1"
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
            <div className="h-5 w-60 border-b border-subCoral flex items-center">
              <p className="text-subCoral text-10 font-semibold w-8">
                {getPriceTypeLabel(watch('price_type'))}
              </p>
              <input
                type="number"
                placeholder="얼마에 마셨는지 기록해보세요!"
                className="text-10 font-[#BFBFBF] w-full text-mainDarkGray text-right"
                maxLength={10}
                {...register('price')}
              />
              <Image
                src="/icon/won-subcoral.svg"
                alt="wonIcon"
                width={15}
                height={15}
              />
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
              <p className="text-12 text-mainGray">초기화</p>
              <Image
                src="/icon/reset-mainGray.svg"
                alt="resetIcon"
                width={13}
                height={13}
              />
            </div>
          </div>
        )}
      </div>
    </OptionsContainer>
  );
}

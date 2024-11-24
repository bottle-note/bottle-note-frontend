import React, { useState } from 'react';
import Image from 'next/image';
import { useFormContext } from 'react-hook-form';

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
  const [isOpen, setIsOpen] = useState(false);

  const getPriceTypeLabel = (priceType: 'BOTTLE' | 'GLASS' | null) => {
    if (priceType === 'BOTTLE') return '1병에';
    if (priceType === 'GLASS') return '1잔에';
    return '';
  };

  return (
    <article className="space-y-2">
      <div className="flex items-center justify-between">
        <div
          className={`flex items-center space-x-1 ${watch('price') || watch('price_type') ? 'w-[80%]' : 'w-full'}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <Image
            src="/icon/money-subcoral.svg"
            alt="moneyIcon"
            width={24}
            height={24}
          />
          <p className="text-12 text-mainDarkGray font-bold">
            가격 <span className="text-mainGray font-normal">(선택)</span>
          </p>
        </div>
        {(watch('price') || watch('price_type')) && (
          <div
            className="flex items-center cursor-pointer"
            onClick={() => {
              setValue('price', null);
              setValue('price_type', null);
            }}
          >
            <p className="text-10 text-mainGray">입력삭제</p>
            <Image
              src="/icon/close-subcoral.svg"
              alt="closeIcon"
              width={18}
              height={18}
            />
          </div>
        )}
      </div>
      {isOpen && (
        <div className="w-[80%] pl-7">
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
          <div className="border-b border-subCoral py-2 flex items-center">
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
        </div>
      )}
    </article>
  );
}

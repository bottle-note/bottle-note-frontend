import React from 'react';
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
  const { register, watch } = useFormContext();
  return (
    <article className="grid grid-cols-3">
      <div className="flex items-start space-x-1 col-span-1">
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
      <div className="col-span-2">
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
            {watch('price_type') === 'BOTTLE' ? '1병에' : '1잔에'}
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
    </article>
  );
}

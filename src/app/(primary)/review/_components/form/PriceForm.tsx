import React from 'react';
import { CircleX } from 'lucide-react';
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
              className="flex items-center text-14 text-fg-neutral"
            >
              <input
                type="radio"
                className="mr-1 h-5 w-5 accent-bg-brand-solid"
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
            <div className="flex h-7 min-w-0 flex-1 items-center border-b border-stroke-brand-solid">
              <span className="shrink-0 pr-1 text-15 text-fg-brand">
                {getPriceTypeLabel(watch('price_type'))}
              </span>
              <div className="flex-1 min-w-0 relative h-full">
                <input
                  type="number"
                  className="absolute inset-0 h-full w-full bg-transparent pb-[1.5px] pr-2 text-right text-15 text-fg-neutral focus-visible:ring-2 focus-visible:ring-stroke-focus-ring [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  maxLength={10}
                  {...register('price', {
                    setValueAs: (value) =>
                      value === '' || value === 0 ? null : value,
                  })}
                />
                {!watch('price') && (
                  <span className="pointer-events-none absolute inset-0 flex items-center truncate text-15 text-fg-neutral-muted">
                    얼마에 마셨는지 기록해보세요!
                  </span>
                )}
              </div>
              <span className="shrink-0 text-15 text-fg-brand">원</span>
            </div>
            <button
              type="button"
              className="flex items-center gap-[2px] shrink-0"
              onClick={resetPrice}
            >
              <span className="text-14 text-fg-neutral-muted">초기화</span>
              <CircleX aria-hidden className="h-4 w-4 text-fg-neutral-muted" />
            </button>
          </div>
        )}
      </div>
    </OptionsContainer>
  );
}

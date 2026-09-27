'use client';

import { useFormContext } from 'react-hook-form';
import { FormValues } from '@/types/Inquire';
import Label from '@/components/ui/Display/Label';
import { SERVICE_TYPE_LIST, BUSINESS_TYPE_LIST } from '@/constants/Inquire';

interface InquireTypeSelectorProps {
  paramsType: 'service' | 'business';
}

export default function InquireTypeSelector({
  paramsType,
}: InquireTypeSelectorProps) {
  const { setValue, watch } = useFormContext<FormValues>();

  const labelBaseStyle =
    'border border-stroke-brand-solid rounded-md text-15 px-12 py-8';
  const typeList =
    paramsType === 'business' ? BUSINESS_TYPE_LIST : SERVICE_TYPE_LIST;

  return (
    <article className="space-y-10">
      <label
        className="block font-bold text-fg-neutral-muted text-13 mb-4"
        htmlFor="type"
      >
        문의 유형
      </label>
      <div className="flex flex-wrap gap-8">
        {typeList.map((item) => {
          return (
            <Label
              key={item.name}
              name={item.name}
              isSelected={
                paramsType === 'business'
                  ? (watch('businessSupportType') as string) === item.type
                  : (watch('type') as string) === item.type
              }
              onClick={() => {
                if (paramsType === 'business') {
                  setValue('businessSupportType', item.type as string);
                } else {
                  setValue('type', item.type as string);
                }
              }}
              selectedStyle={
                labelBaseStyle + ' bg-bg-brand-solid text-fg-brand-contrast'
              }
              unselectedStyle={
                labelBaseStyle + ' bg-bg-layer-default text-fg-brand'
              }
            />
          );
        })}
      </div>
    </article>
  );
}

'use client';

import { useFormContext } from 'react-hook-form';
import { FormValues } from '@/types/Inquire';
import Label from '@/app/(primary)/_components/Label';
import { SERVICE_TYPE_LIST, BUSINESS_TYPE_LIST } from '@/constants/Inquire';

interface InquireTypeSelectorProps {
  paramsType: 'service' | 'business';
}

export default function InquireTypeSelector({
  paramsType,
}: InquireTypeSelectorProps) {
  const { setValue, watch } = useFormContext<FormValues>();

  const labelBaseStyle = 'border border-subCoral rounded-md text-15 px-3 py-2';
  const typeList =
    paramsType === 'business' ? BUSINESS_TYPE_LIST : SERVICE_TYPE_LIST;

  return (
    <article className="space-y-[10px]">
      <label
        className="block font-bold text-mainGray text-13 mb-1"
        htmlFor="type"
      >
        문의 유형
      </label>
      <div className="flex flex-wrap gap-2">
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
              selectedStyle={labelBaseStyle + ' bg-subCoral text-white'}
              unselectedStyle={labelBaseStyle + ' bg-white text-subCoral'}
            />
          );
        })}
      </div>
    </article>
  );
}

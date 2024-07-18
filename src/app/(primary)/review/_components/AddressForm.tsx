'use client';

import React from 'react';
import Image from 'next/image';
import { useFormContext } from 'react-hook-form';
import { Address, useDaumPostcodePopup } from 'react-daum-postcode';

export default function AddressForm() {
  const { watch, setValue, register } = useFormContext();
  const postcodeOpen = useDaumPostcodePopup();

  const handleComplete = (data: Address) => {
    setValue('zipCode', data.zonecode);
    setValue('address', data.address);
  };

  return (
    <article className="flex items-center justify-between">
      <div className="flex items-center space-x-1 w-3/4">
        <Image
          src="/icon/marker-subcoral.svg"
          alt="placeIcon"
          width={20}
          height={20}
        />
        {!watch('address') ? (
          <p className="text-10 text-mainDarkGray font-bold">
            이 술을 마셨을 때, 좋았던 장소가 있나요?{' '}
            <span className="text-mainGray font-normal">(선택)</span>
          </p>
        ) : (
          <div className="w-full">
            <p className="text-10 text-mainDarkGray">{watch('zipCode')}</p>
            <p className="text-10 text-mainDarkGray font-bold">
              {watch('address')}
            </p>
            <input
              type="text"
              placeholder="상세주소"
              className="text-10 border-b border-subCoral w-full"
              maxLength={30}
              {...register('detailAddress')}
            />
          </div>
        )}
      </div>
      <button
        className="flex items-center"
        onClick={() => {
          postcodeOpen({ onComplete: handleComplete });
        }}
      >
        <p className="text-mainGray font-normal text-10">
          {watch('address') && '변경'}
        </p>
        <Image
          src="/icon/arrow-right-subcoral.svg"
          alt="rightIcon"
          width={18}
          height={18}
        />
      </button>
    </article>
  );
}

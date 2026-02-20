'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useFormContext } from 'react-hook-form';
import SearchAddress from '../SearchAddress';
import OptionsContainer from '../OptionsContainer';

export default function AddressForm() {
  const { watch, register, setValue } = useFormContext();
  const currentLocationName = watch('locationName');
  const [searchModal, setSearchModal] = useState(false);
  const [title, setTitle] = useState('장소');

  const handleCloseModal = () => {
    setSearchModal(false);
  };

  const resetAddress = () => {
    setValue('locationName', null);
    setValue('address', null);
    setValue('category', null);
    setValue('mapUrl', null);
    setValue('longitude', null);
    setValue('latitude', null);
  };

  useEffect(() => {
    if (currentLocationName) setTitle(currentLocationName);
    else setTitle('장소');
  }, [currentLocationName]);

  const ExtraButtons = (
    <div className="flex gap-1">
      <a
        href={watch('mapUrl') || '#'}
        onClick={(e) => {
          e.preventDefault();
          const mapUrl = watch('mapUrl');
          if (mapUrl) {
            window.open(mapUrl, '_blank', 'noopener,noreferrer');
          }
        }}
        className="text-subCoral cursor-pointer"
      >
        지도보기
      </a>
      <div className="text-subCoral">|</div>
      <button
        onClick={() => {
          setSearchModal(true);
        }}
        className="text-subCoral"
      >
        주소변경
      </button>
      <div className="text-subCoral">|</div>
      <button
        className="flex items-center space-x-[2px]"
        onClick={resetAddress}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            resetAddress();
          }
        }}
      >
        <p className="text-mainGray">주소삭제</p>
        <Image
          src="/icon/reset-mainGray.svg"
          alt="resetIcon"
          width={16}
          height={16}
        />
      </button>
    </div>
  );

  return (
    <>
      <OptionsContainer
        iconSrc="/icon/marker-subcoral.svg"
        iconAlt="placeIcon"
        title={title}
        subTitle={currentLocationName ? '' : '(선택)'}
        forceOpen={searchModal}
      >
        <article className="ml-7 mt-[6px] text-14">
          {!watch('address') ? (
            <button
              className="w-full border-subCoral border rounded-lg py-2"
              onClick={() => {
                setSearchModal(true);
              }}
            >
              <p className="text-subCoral">장소 검색</p>
            </button>
          ) : (
            <div className="w-full space-y-1">
              <div className="pb-1">{watch('mapUrl') && ExtraButtons}</div>
              <p className="text-mainDarkGray">{watch('address')}</p>
              <div className="border-b border-subCoral">
                <input
                  type="text"
                  placeholder="상세 주소를 입력하세요."
                  className="w-full h-5 text-mainDarkGray bg-transparent border-none focus:outline-none placeholder:text-[#BFBFBF]"
                  maxLength={30}
                  {...register('detailAddress')}
                />
              </div>
            </div>
          )}
        </article>
      </OptionsContainer>
      {searchModal && <SearchAddress handleCloseModal={handleCloseModal} />}
    </>
  );
}

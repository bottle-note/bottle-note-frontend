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
    <div className="flex gap-1 text-12">
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
        <p className="text-12 text-mainGray">주소삭제</p>
        <Image
          src="/icon/reset-mainGray.svg"
          alt="resetIcon"
          width={13}
          height={13}
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
        <article className="ml-7">
          {!watch('address') ? (
            <button
              className="w-full border-subCoral border rounded-lg py-2"
              onClick={() => {
                setSearchModal(true);
              }}
            >
              <p className="text-subCoral font-14 text-14">장소 검색</p>
            </button>
          ) : (
            <div className="w-full space-y-1">
              <div className="pb-1">{watch('mapUrl') && ExtraButtons}</div>
              <p className="text-10 text-mainDarkGray">{watch('address')}</p>
              <div className="flex items-center justify-between">
                <div className="w-60 h-5 border-b border-subCoral flex items-center">
                  <input
                    type="text"
                    placeholder="상세 주소를 입력하세요."
                    className="text-10 font-[#BFBFBF] w-full text-mainDarkGray"
                    maxLength={30}
                    {...register('detailAddress')}
                  />
                </div>
              </div>
            </div>
          )}
        </article>
      </OptionsContainer>
      {searchModal && <SearchAddress handleCloseModal={handleCloseModal} />}
    </>
  );
}

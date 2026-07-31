'use client';

import React, { useState, useEffect } from 'react';
import { CircleX } from 'lucide-react';
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
        className="cursor-pointer text-fg-brand"
      >
        지도보기
      </a>
      <div className="text-fg-brand">|</div>
      <button
        type="button"
        onClick={() => {
          setSearchModal(true);
        }}
        className="text-fg-brand"
      >
        주소변경
      </button>
      <div className="text-fg-brand">|</div>
      <button
        type="button"
        className="flex items-center space-x-[2px]"
        onClick={resetAddress}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            resetAddress();
          }
        }}
      >
        <p className="text-fg-neutral-muted">주소삭제</p>
        <CircleX aria-hidden className="h-4 w-4 text-fg-neutral-muted" />
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
              type="button"
              className="w-full rounded-lg border border-stroke-brand-solid py-2"
              onClick={() => {
                setSearchModal(true);
              }}
            >
              <p className="text-fg-brand">장소 검색</p>
            </button>
          ) : (
            <div className="w-full space-y-1">
              <div className="pb-1">{watch('mapUrl') && ExtraButtons}</div>
              <p className="text-fg-neutral">{watch('address')}</p>
              <div className="border-b border-stroke-brand-solid">
                <input
                  type="text"
                  placeholder="상세 주소를 입력하세요."
                  className="h-5 w-full border-none bg-transparent text-fg-neutral placeholder:text-fg-neutral-muted focus-visible:ring-2 focus-visible:ring-stroke-focus-ring"
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

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useFormContext } from 'react-hook-form';
import SearchAddress from './SearchAddress';

export default function AddressForm() {
  const { watch } = useFormContext();
  const [searchModal, setSearchModal] = useState(false);

  const handleCloseModal = () => {
    setSearchModal(false);
  };

  return (
    <>
      <article className="flex items-center justify-between">
        <div className="flex items-center space-x-1 w-3/4">
          <Image
            src="/icon/marker-subcoral.svg"
            alt="placeIcon"
            width={20}
            height={20}
          />
          {!watch('streetAddress') ? (
            <p className="text-10 text-mainDarkGray font-bold">
              이 술을 마셨을 때, 좋았던 장소가 있나요?{' '}
              <span className="text-mainGray font-normal">(선택)</span>
            </p>
          ) : (
            <div className="w-full">
              <p className="text-10 text-mainDarkGray font-bold">
                {watch('locationName')}
              </p>
              <p className="text-10 text-mainDarkGray">
                {watch('streetAddress')}
              </p>
              <p className="text-10 text-mainDarkGray m-0 p-0">
                <Link href={watch('mapUrl')}>지도보기</Link>
              </p>
            </div>
          )}
        </div>
        <button
          className="flex items-center"
          onClick={() => {
            setSearchModal(true);
          }}
        >
          <p className="text-mainGray font-normal text-10">
            {watch('streetAddress') && '변경'}
          </p>
          <Image
            src="/icon/arrow-right-subcoral.svg"
            alt="rightIcon"
            width={18}
            height={18}
          />
        </button>
      </article>
      {searchModal && <SearchAddress handleCloseModal={handleCloseModal} />}
    </>
  );
}

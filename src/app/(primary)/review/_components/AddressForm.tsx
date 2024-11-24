'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useFormContext } from 'react-hook-form';
import SearchAddress from './SearchAddress';

export default function AddressForm() {
  const { watch, register } = useFormContext();
  const [searchModal, setSearchModal] = useState(false);

  const handleCloseModal = () => {
    setSearchModal(false);
  };

  return (
    <>
      <article className="flex items-center justify-between">
        <div className="flex items-center space-x-1 w-full">
          <Image
            src="/icon/marker-subcoral.svg"
            alt="placeIcon"
            width={24}
            height={24}
          />
          {!watch('address') ? (
            <p className="text-12 text-mainDarkGray font-bold">
              이 술을 마셨을 때, 좋았던 장소가 있나요?{' '}
              <span className="text-mainGray font-normal">(선택)</span>
            </p>
          ) : (
            <div className="w-full">
              <div className="flex items-center space-x-2">
                <p className="text-10 text-mainDarkGray font-bold">
                  {watch('locationName')}
                </p>
                <p className="text-10 text-mainGray m-0 p-0">
                  <Link
                    href={watch('mapUrl')}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    지도보기
                  </Link>
                </p>
              </div>
              <p className="text-10 text-mainDarkGray">{watch('address')}</p>
              <div className="border-b border-subCoral py-2 flex items-center">
                <input
                  type="text"
                  placeholder="상세 주소를 입력하세요."
                  className="text-10 font-[#BFBFBF] w-full text-mainDarkGray"
                  maxLength={30}
                  {...register('detailAddress')}
                />
              </div>
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
      {searchModal && <SearchAddress handleCloseModal={handleCloseModal} />}
    </>
  );
}

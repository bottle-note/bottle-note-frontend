import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LinkData } from '@/types/LinkButton';

interface Props {
  data: LinkData;
}

function LinkButton({
  data: { listType = 'Full', engName, korName, imgSrc, linkSrc, icon = false },
}: Props) {
  return (
    <div
      className={`relative w-full hover:pointer ${
        listType === 'Full'
          ? 'h-20 flex items-center'
          : 'rounded-xl bg-mainCoral h-[10.0625rem]'
      }`}
    >
      {listType === 'Full' && (
        <>
          <div className="absolute w-full h-full rounded-xl bg-[url('/bg_category.jpg')] bg-cover bg-center" />
          <div className="absolute w-full h-full rounded-xl bg-mainCoral bg-opacity-90" />
        </>
      )}
      <Link
        href={linkSrc}
        className={`h-full ${listType === 'Full' ? 'w-full' : 'max-w-[10.0625rem]'} flex flex-col justify-between relative z-10 ${listType === 'Full' ? 'py-[1.0638rem] px-[1.0638rem]' : 'py-[0.813rem] px-[1.13rem]'}`}
      >
        <div className={`${icon && 'flex justify-between'} text-white h-10`}>
          <div>
            <p className="text-[16px] font-bold leading-5">{engName}</p>
            <p className="font-bold text-sm">{korName}</p>
          </div>
          {icon && (
            <Image
              src="/icon/arrow-right-white.svg"
              alt="arrowIcon"
              width={23}
              height={23}
            />
          )}
        </div>
        <div className="border-[0.0313rem] border-white" />
      </Link>
      {imgSrc && (
        <Image
          className="z-10 absolute bottom-0 right-0"
          src={imgSrc}
          height={100}
          width={100}
          alt="categoryImg"
        />
      )}
    </div>
  );
}

export default LinkButton;

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LinkData } from '@/types/LinkButton';

interface Props {
  data: LinkData;
}

function LinkButton({
  data: {
    listType = 'Full',
    engName,
    korName,
    imgSrc,
    linkSrc,
    imageSize,
    icon = false,
    handleBeforeRouteChange,
  },
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
        onClick={handleBeforeRouteChange}
        className={`h-full ${listType === 'Full' ? 'w-full' : 'max-w-[10.0625rem]'} flex flex-col justify-between relative z-10 ${listType === 'Full' ? 'py-[1.0638rem] px-[1.0638rem]' : 'py-[0.813rem] px-[1.13rem]'}`}
      >
        <div className={`${icon && 'flex justify-between'} text-white h-10`}>
          <div>
            <p className="font-bold text-15">{korName}</p>
            <p className="text-13 font-light">{engName}</p>
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
        {imgSrc && (
          <Image
            className="z-10 absolute bottom-[0.5px] left-[5.7rem]"
            src={imgSrc}
            height={imageSize?.height}
            width={imageSize?.width}
            alt="categoryImg"
            layout="fixed"
          />
        )}
      </Link>
    </div>
  );
}

export default LinkButton;

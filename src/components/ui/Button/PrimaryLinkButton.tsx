import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LinkData } from '@/types/LinkButton';

interface Props {
  data: LinkData;
}

function PrimaryLinkButton({
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
        listType === 'Full' ? 'flex items-center' : 'rounded-xl bg-mainCoral'
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
        className="h-full w-full flex flex-col justify-between relative z-10 py-[16.5px] px-[17.02px]"
      >
        <div className={`${imgSrc ? 'space-y-[90px]' : 'space-y-[11.7px]'}`}>
          <div
            className={`${icon && 'flex justify-between'} text-white relative z-20`}
          >
            <div>
              <p className="font-extrabold text-14">{korName}</p>
              <p className="text-12 font-normal">{engName}</p>
            </div>
            {icon && (
              <Image
                src="/icon/arrow-right-white.svg"
                alt="arrowIcon"
                width={25}
                height={25}
                style={{ width: 25, height: 25 }}
              />
            )}
          </div>
          <div className="border-[1px] border-white relative z-0" />
        </div>
        {imgSrc && (
          <Image
            className="absolute bottom-[0.5px] right-4 z-10"
            src={imgSrc}
            height={imageSize?.height}
            width={imageSize?.width}
            alt="categoryImg"
            style={{ width: imageSize?.width, height: imageSize?.height }}
          />
        )}
      </Link>
    </div>
  );
}

export default PrimaryLinkButton;

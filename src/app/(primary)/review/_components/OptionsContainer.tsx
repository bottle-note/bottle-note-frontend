import React, { useState } from 'react';
import Image from 'next/image';

interface Props {
  iconSrc: string;
  iconAlt: string;
  title: string;
  subTitle?: string;
  children: React.ReactNode;
}

export default function OptionsContainer({
  iconSrc,
  iconAlt,
  title,
  subTitle = '',
  children,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <article className="space-y-2">
      <div className="flex items-center justify-between">
        <div
          className="flex items-center space-x-1 w-full"
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setIsOpen(!isOpen);
            }
          }}
        >
          <Image src={iconSrc} alt={iconAlt} width={24} height={24} />
          <p className="text-12 text-mainDarkGray font-bold">
            {title}{' '}
            <span className="text-mainGray font-normal">{subTitle}</span>
          </p>
        </div>
        <div className="flex items-center cursor-pointer">
          {isOpen ? (
            <Image
              src="/icon/arrow-up-subcoral.svg"
              alt="closeIcon"
              width={16}
              height={16}
            />
          ) : (
            <Image
              src="/icon/arrow-down-subcoral.svg"
              alt="openIcon"
              width={16}
              height={16}
            />
          )}
        </div>
      </div>
      {isOpen && children}
    </article>
  );
}

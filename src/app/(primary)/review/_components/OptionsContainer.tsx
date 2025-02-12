import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface Props {
  iconSrc: string;
  iconAlt: string;
  title: string;
  subTitle?: string;
  forceOpen?: boolean;
  children: React.ReactNode;
  titleSideArea?: {
    component: React.ReactNode;
  };
}

export default function OptionsContainer({
  iconSrc,
  iconAlt,
  title,
  subTitle = '',
  forceOpen = false,
  children,
  titleSideArea,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (forceOpen) setIsOpen(forceOpen);
  }, [forceOpen]);

  return (
    <article className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <Image src={iconSrc} alt={iconAlt} width={24} height={24} />
          <p className="text-12 text-mainDarkGray font-bold">
            {title}{' '}
            <span className="text-mainGray font-normal">{subTitle}</span>
          </p>
          {titleSideArea?.component}
        </div>
        <div
          className="flex items-center cursor-pointer"
          onClick={handleOpen}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleOpen();
            }
          }}
        >
          <Image
            className={`transition-transform duration-300 ${
              isOpen ? 'rotate-0' : 'rotate-180'
            }`}
            src={'/icon/arrow-up-subcoral.svg'}
            alt={isOpen ? 'closeIcon' : 'openIcon'}
            width={16}
            height={16}
          />
        </div>
      </div>
      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div
          className={`transform transition-all duration-500 ease-out ${
            isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          {children}
        </div>
      </div>
    </article>
  );
}

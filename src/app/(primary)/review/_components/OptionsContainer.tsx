import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import AnimatedCollapse from '@/components/ui/Display/AnimatedCollapse';

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
    <article className={isOpen ? 'space-y-2' : ''}>
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={handleOpen}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleOpen();
          }
        }}
      >
        <div className="flex items-center space-x-1">
          <Image src={iconSrc} alt={iconAlt} width={20} height={20} />
          <p className="text-15 font-bold text-fg-neutral">
            {title}{' '}
            <span className="text-13 font-normal text-fg-neutral-muted">
              {subTitle}
            </span>
          </p>
          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
              }
            }}
          >
            {titleSideArea?.component}
          </div>
        </div>
        <div className="flex items-center">
          <Image
            className={`transition-transform duration-300 ${
              isOpen ? 'rotate-0' : 'rotate-180'
            }`}
            src="/icon/arrow-up-subcoral.svg"
            alt={isOpen ? 'closeIcon' : 'openIcon'}
            width={16}
            height={16}
          />
        </div>
      </div>
      <AnimatedCollapse isOpen={isOpen}>{children}</AnimatedCollapse>
    </article>
  );
}

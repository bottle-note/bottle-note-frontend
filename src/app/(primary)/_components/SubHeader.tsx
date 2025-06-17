'use client';

import React, { ReactNode, MouseEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ROUTES } from '@/constants/routes';
import SidebarHeader from '@/app/(primary)/_components/SidebarHeader';

import Logo from 'public/bottle_note_Icon_logo.svg';

interface HeaderLeftProps {
  children?: ReactNode;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  showLogo?: boolean;
}

const HeaderLeft = ({
  children,
  onClick,
  showLogo = false,
}: HeaderLeftProps) => {
  const leftLayoutClass = 'pl-[17px]';

  if (showLogo) {
    return (
      <Link href={ROUTES.HOME} className={leftLayoutClass}>
        <Image src={Logo} alt="Logo" priority />
      </Link>
    );
  }

  return (
    <div
      className={leftLayoutClass}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.(e as unknown as MouseEvent<HTMLDivElement>);
        }
      }}
    >
      {children}
    </div>
  );
};

interface HeaderCenterProps {
  children: ReactNode;
  textColor?: string;
}

const HeaderCenter = ({
  children,
  textColor = 'text-subCoral',
}: HeaderCenterProps) => {
  return (
    <p
      className={`${textColor} whitespace-nowrap text-[clamp(12px,5vw,16px)] font-bold `}
    >
      {children}
    </p>
  );
};

interface HeaderRightProps {
  children?: ReactNode;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  showSideMenu?: boolean;
}

const HeaderRight = ({
  children,
  onClick,
  showSideMenu = false,
}: HeaderRightProps) => {
  return (
    <div
      className="pr-[17px]"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.(e as unknown as MouseEvent<HTMLDivElement>);
        }
      }}
    >
      {children}
      {showSideMenu && <SidebarHeader />}
    </div>
  );
};

interface SubHeaderMainProps {
  children?: ReactNode;
  bgColor?: string;
}

function SubHeaderMain({ children, bgColor = 'bg-white' }: SubHeaderMainProps) {
  return (
    <div
      className={`${bgColor} flex justify-between items-center relative pt-[74px] pb-[15px]`}
    >
      {children}
    </div>
  );
}

export const SubHeader = Object.assign(SubHeaderMain, {
  Left: HeaderLeft,
  Center: HeaderCenter,
  Right: HeaderRight,
});

'use client';

import React, {
  ReactNode,
  MouseEvent,
  Children,
  ReactElement,
  isValidElement,
} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/auth/useAuth';
import Logo from 'public/bottle_note_Icon_logo.svg';
import Menu from 'public/icon/menu-subcoral.svg';

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
  if (showLogo) {
    return (
      <Link href={ROUTES.HOME}>
        <Image src={Logo} alt="Logo" priority />
      </Link>
    );
  }

  return (
    <div
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.(e as unknown as MouseEvent<HTMLDivElement>);
        }
      }}
      role="button"
      tabIndex={0}
      className="cursor-pointer"
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
  const { isLoggedIn } = useAuth();

  return (
    <div
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.(e as unknown as MouseEvent<HTMLDivElement>);
        }
      }}
    >
      {children}
      <div className="pt-2">
        {showSideMenu && isLoggedIn ? (
          <Link href={ROUTES.SETTINGS.BASE}>
            <Image src={Menu} alt="Settings" />
          </Link>
        ) : null}
      </div>
    </div>
  );
};

interface SubHeaderMainProps {
  children?: ReactNode;
  bgColor?: string;
}

function SubHeaderMain({ children, bgColor = 'bg-white' }: SubHeaderMainProps) {
  let leftComponent = null;
  let centerComponent = null;
  let rightComponent = null;

  Children.forEach(children, (child) => {
    if (isValidElement(child)) {
      const childType = (child as ReactElement).type;

      if (childType === HeaderLeft) {
        leftComponent = child;
      } else if (childType === HeaderCenter) {
        centerComponent = child;
      } else if (childType === HeaderRight) {
        rightComponent = child;
      }
    }
  });

  return (
    <div
      className={`${bgColor} flex items-center w-full px-[17px] pb-[15px] pt-[74px]`}
    >
      <div className="flex-1 flex items-center min-w-0">{leftComponent}</div>
      <div className="flex-1 flex justify-center items-center min-w-0">
        {centerComponent}
      </div>
      <div className="flex-1 flex justify-end items-center min-w-0">
        {rightComponent}
      </div>
    </div>
  );
}

export const SubHeader = Object.assign(SubHeaderMain, {
  Left: HeaderLeft,
  Center: HeaderCenter,
  Right: HeaderRight,
});

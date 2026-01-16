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
}

const HeaderLeft = ({ children, onClick }: HeaderLeftProps) => {
  if (!children) return null;

  if (!onClick) {
    return <div>{children}</div>;
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
}

const HeaderRight = ({ children, onClick }: HeaderRightProps) => {
  if (!children) return null;

  if (!onClick) {
    return <div>{children}</div>;
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

const HeaderLogo = () => {
  return (
    <Link href={ROUTES.HOME}>
      <Image src={Logo} alt="Logo" priority />
    </Link>
  );
};

const HeaderMenu = () => {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) return null;

  return (
    <div className="pt-2">
      <Link href={ROUTES.SETTINGS.BASE}>
        <Image src={Menu} alt="Settings" />
      </Link>
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
      className={`${bgColor} flex items-center w-full px-[17px] pb-[15px] pt-safe-header`}
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
  Logo: HeaderLogo,
  Menu: HeaderMenu,
});

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
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import { useNotificationUnreadCount } from '@/queries/useNotificationsQuery';
import useModalStore from '@/store/modalStore';
import { ROUTES } from '@/constants/routes';
import Logo from 'public/bottle_note_Icon_logo.svg';
import Menu from 'public/icon/menu-subcoral.svg';
import UserIcon from 'public/icon/user-outlined-subcoral.svg';

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
  textColor = 'text-fg-brand',
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
  return (
    <div className="pt-8">
      <Link href={ROUTES.SETTINGS.BASE}>
        <Image src={Menu} alt="Settings" />
      </Link>
    </div>
  );
};

const HeaderNotificationBell = () => {
  const { user, isLoggedIn } = useAuthSession();
  const userId =
    process.env.NEXT_PUBLIC_DEPLOY_ENV === 'development' && isLoggedIn
      ? user?.userId ?? null
      : null;
  const { data } = useNotificationUnreadCount(userId);

  if (userId === null) return null;

  const unreadCount = data?.unreadCount ?? 0;

  return (
    <Link
      href={ROUTES.NOTIFICATIONS}
      aria-label={
        unreadCount > 0 ? `알림함, 읽지 않은 알림 ${unreadCount}개` : '알림함'
      }
      className="relative inline-flex items-center justify-center pt-8 text-subCoral focus-visible:outline focus-visible:outline-2 focus-visible:outline-stroke-focus-ring"
    >
      <Bell size={22} strokeWidth={2} aria-hidden="true" />
      {unreadCount > 0 && (
        <span className="absolute -right-8 top-2 flex h-17 min-w-17 items-center justify-center rounded-full border-2 border-bg-layer-default bg-subCoral px-2 text-10 font-bold leading-none text-palette-static-white">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
};

const HeaderProfile = () => {
  const router = useRouter();
  const { user, isLoggedIn } = useAuthSession();
  const { handleLoginModal } = useModalStore();

  const handleClick = () => {
    if (isLoggedIn && user?.userId) {
      router.push(ROUTES.USER.BASE(user.userId));
      return;
    }
    handleLoginModal();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="마이"
      className="pt-8"
    >
      <Image src={UserIcon} alt="" width={22} height={22} />
    </button>
  );
};

interface SubHeaderMainProps {
  children?: ReactNode;
  bgColor?: string;
}

function SubHeaderMain({
  children,
  bgColor = 'bg-bg-layer-default',
}: SubHeaderMainProps) {
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
      className={`${bgColor} flex items-center w-full px-17 pb-15 pt-safe-header`}
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
  NotificationBell: HeaderNotificationBell,
  Profile: HeaderProfile,
});

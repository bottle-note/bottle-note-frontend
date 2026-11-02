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
import { Bell, Search } from 'lucide-react';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import { useNotificationUnreadCount } from '@/queries/useNotificationsQuery';
import { isDevelopmentDeployment } from '@/lib/environment';
import useModalStore from '@/store/modalStore';
import { ROUTES } from '@/constants/routes';
import { trackGA4Event } from '@/utils/analytics/ga4';
import Logo from 'public/bottle_note_Icon_logo.svg';
import Menu from 'public/icon/menu-subcoral.svg';
import UserIcon from 'public/icon/user-outlined-subcoral.svg';

interface HeaderLeftProps {
  children?: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  // 아이콘만 있는 버튼의 이름. 왼쪽 버튼은 모두 뒤로 가기라 기본값을 둔다
  label?: string;
}

const HeaderLeft = ({
  children,
  onClick,
  label = '뒤로 가기',
}: HeaderLeftProps) => {
  if (!children) return null;

  if (!onClick) {
    return <div>{children}</div>;
  }

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="cursor-pointer"
    >
      {children}
    </button>
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
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  // 아이콘만 있는 버튼이면 무엇을 하는 버튼인지 적는다
  label?: string;
}

const HeaderRight = ({ children, onClick, label }: HeaderRightProps) => {
  if (!children) return null;

  if (!onClick) {
    return <div>{children}</div>;
  }

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="cursor-pointer"
    >
      {children}
    </button>
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

const HeaderSearch = () => {
  return (
    <Link
      href={ROUTES.EXPLORE.WHISKEY_SEARCH_FOCUSED}
      prefetch={false}
      aria-label="위스키 검색"
      onClick={() => trackGA4Event('header_search_click')}
      className="inline-flex items-center justify-center pt-8 text-subCoral focus-visible:outline focus-visible:outline-2 focus-visible:outline-stroke-focus-ring"
    >
      <Search size={22} strokeWidth={2} aria-hidden="true" />
    </Link>
  );
};

const HeaderNotificationBell = () => {
  const { user, isLoggedIn } = useAuthSession();
  const userId =
    isDevelopmentDeployment() && isLoggedIn ? user?.userId ?? null : null;
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
  Search: HeaderSearch,
  Profile: HeaderProfile,
});

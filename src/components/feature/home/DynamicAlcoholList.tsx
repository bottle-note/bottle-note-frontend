'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import AlcoholItem from '@/components/feature/home/AlcoholItem';
import { usePopularList } from '@/hooks/usePopularList';
import { useAuth } from '@/hooks/auth/useAuth';
import {
  DescriptionSkeleton,
  LoadingStateSkeleton,
} from '@/components/ui/Loading/Skeletons/custom/PopularSkeleton';
import { PopularType } from '@/types/Popular';
import { UserApi } from '@/api/user/user.api';
import { ROUTES } from '@/constants/routes';

interface Props {
  type?: PopularType;
}

const EmptyState = ({ type }: { type: PopularType }) => {
  const emptyStateContent = {
    week: {
      text: '데이터 준비 중 입니다.',
    },
    spring: {
      text: '데이터 준비 중 입니다.',
    },
    recent: {
      text: '최근에 본 위스키가 없어요.',
    },
  };

  const content = emptyStateContent[type];

  return (
    <div className="h-[225px] flex flex-col items-center justify-center">
      <Image
        src="/icon/logo-subcoral.svg"
        alt="logo"
        width={30}
        height={30}
        style={{ width: 30, height: 30 }}
        priority
      />
      <p className="text-mainGray text-15 mt-5">{content.text}</p>
    </div>
  );
};

const Description = ({
  type,
  isLoading = true,
}: {
  type: PopularType;
  isLoading: boolean;
}) => {
  const [userInfo, setUserInfo] = useState<{ nickname?: string }>({});

  useEffect(() => {
    if (type === 'recent' && !isLoading) {
      UserApi.getCurUserInfo().then((res) => setUserInfo(res.data));
    }
  }, [type, isLoading]);

  if (isLoading) {
    return <DescriptionSkeleton />;
  }

  switch (type) {
    case 'week':
      return (
        <>
          <p className="pb-[10px] text-13 font-extrabold text-mainCoral">
            WEEKLY HOT 5
          </p>
          <div className="text-20 font-bold space-y-[2px] pb-5">
            <p>이번 주 사람들이 가장 많이 검색한</p>
            <p>HOT5를 확인해보세요🔥</p>
          </div>
        </>
      );
    case 'spring':
      return (
        <>
          <p className="pb-[10px] text-13 font-extrabold text-mainCoral">
            SPRING PICKS
          </p>
          <div className="text-20 font-bold space-y-[2px] pb-5">
            <p>봄에 어울리는 술</p>
            <p>봄바람처럼 부드러운 한 잔🌸</p>
          </div>
        </>
      );
    case 'recent':
      return (
        <>
          <p className="pb-[10px] text-13 font-extrabold text-mainCoral">
            VIEW HISTORY
          </p>
          <div className="text-20 font-bold space-y-[2px] pb-5">
            <p>{userInfo.nickname ?? ''} 님이</p>
            <p>최근 본 위스키에요🥃</p>
          </div>
        </>
      );
    default:
      return null;
  }
};

const LoginRequired = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full -ml-[25px]">
      <div className="flex flex-col items-center justify-center flex-grow space-y-[14px]">
        <Image
          src="/icon/logo-subcoral.svg"
          alt="logo"
          width={28}
          height={48}
          style={{ width: 28, height: 48 }}
          priority
        />
        <p className="text-mainGray text-16">
          로그인 후 확인 가능한 서비스 입니다.
        </p>
        <button
          className="w-[237px] py-[8.5px] text-16 font-bold text-subCoral border border-subCoral rounded-[18px]"
          onClick={() => router.push(ROUTES.LOGIN)}
        >
          로그인 하러가기
        </button>
      </div>
    </div>
  );
};

const ItemList = ({ items }: { items: any[] }) => {
  return (
    <div className="whitespace-nowrap overflow-x-auto overflow-y-hidden flex space-x-2 scrollbar-hide">
      {items.map((item, index) => (
        <div
          key={item.alcoholId}
          className={`flex-shrink-0 flex-grow-0 rounded-lg ${
            index === items.length - 1 ? 'pr-[25px]' : ''
          }`}
        >
          <AlcoholItem data={item} />
        </div>
      ))}
    </div>
  );
};

const ItemListContainer = ({ children }: { children: React.ReactNode }) => {
  return <div className="h-[321px]">{children}</div>;
};

function DynamicAlcoholList({ type = 'week' }: Props) {
  const { popularList, isLoading } = usePopularList({ type });
  const { isLoggedIn } = useAuth();

  const renderContent = () => {
    if (type === 'recent' && !isLoggedIn) {
      return <LoginRequired />;
    }

    if (isLoading) {
      return <LoadingStateSkeleton />;
    }

    if (popularList.length !== 0) {
      return (
        <>
          <Description type={type} isLoading={isLoading} />
          <ItemList items={popularList} />
        </>
      );
    }

    return <EmptyState type={type} />;
  };

  return <ItemListContainer>{renderContent()}</ItemListContainer>;
}

export default DynamicAlcoholList;

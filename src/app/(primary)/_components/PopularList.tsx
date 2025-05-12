'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import AlcoholCard from '@/app/(primary)/_components/AlcoholCard';
import { usePopularList } from '@/hooks/usePopularList';
import { AuthService } from '@/lib/AuthService';

type ListType = 'week' | 'spring' | 'recent';

interface Props {
  type?: ListType;
}

const EmptyState = ({ type }: { type: ListType }) => {
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
      <Image src="/icon/logo-subcoral.svg" alt="logo" width={30} height={30} />
      <p className="text-mainGray text-15 mt-5">{content.text}</p>
    </div>
  );
};

const Description = ({
  type,
  isLoading = true,
}: {
  type: ListType;
  isLoading: boolean;
}) => {
  if (isLoading) {
    return (
      <>
        <Skeleton height={17} width={120} className="pb-[10px]" />
        <div className="space-y-[2px] pb-5">
          <Skeleton count={2} height={24} width={270} />
        </div>
      </>
    );
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
    default:
      return null;
  }
};

const LoginRequired = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col items-center justify-center flex-grow space-y-[14px]">
        <Image
          src="/icon/logo-subcoral.svg"
          alt="logo"
          width={28}
          height={48}
        />
        <p className="text-mainGray text-16">
          로그인 후 확인 가능한 서비스 입니다.
        </p>
        <button
          className="w-[237px] py-[8.5px] text-16 font-bold text-subCoral border border-subCoral rounded-[18px]"
          onClick={() => router.push('/login')}
        >
          로그인 하러가기
        </button>
      </div>
    </div>
  );
};

const LoadingState = ({
  type,
  isLoading = true,
}: {
  type: ListType;
  isLoading: boolean;
}) => {
  return (
    <>
      {type !== 'recent' && <Description type={type} isLoading={isLoading} />}
      <div className="whitespace-nowrap overflow-x-auto overflow-y-hidden flex space-x-2 scrollbar-hide">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={`skeleton-${uuidv4()}`}
            className={`flex-shrink-0 flex-grow-0 rounded-lg ${
              index === 4 ? 'pr-[25px]' : ''
            }`}
          >
            <Skeleton height={225} width={145} />
          </div>
        ))}
      </div>
    </>
  );
};

const CardList = ({ items }: { items: any[] }) => {
  return (
    <div className="whitespace-nowrap overflow-x-auto overflow-y-hidden flex space-x-2 scrollbar-hide">
      {items.map((item, index) => (
        <div
          key={item.alcoholId}
          className={`flex-shrink-0 flex-grow-0 rounded-lg ${
            index === items.length - 1 ? 'pr-[25px]' : ''
          }`}
        >
          <AlcoholCard data={item} />
        </div>
      ))}
    </div>
  );
};

const CardListContainer = ({ children }: { children: React.ReactNode }) => {
  return <div className="h-[321px]">{children}</div>;
};

function PopularList({ type = 'week' }: Props) {
  const { popularList, isLoading } = usePopularList({ type });
  const { isLogin } = AuthService;

  const renderContent = () => {
    if (type === 'recent' && !isLogin) {
      return <LoginRequired />;
    }

    if (isLoading) {
      return <LoadingState type={type} isLoading={isLoading} />;
    }

    if (popularList.length !== 0) {
      return (
        <>
          <Description type={type} isLoading={isLoading} />
          <CardList items={popularList} />
        </>
      );
    }

    return <EmptyState type={type} />;
  };

  return <CardListContainer>{renderContent()}</CardListContainer>;
}

export default PopularList;

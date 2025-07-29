'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { SubHeader } from '@/app/(primary)/_components/SubHeader';
import { Button } from '@/components/Button';
import { AuthService } from '@/lib/AuthService';
import useModalStore from '@/store/modalStore';
import List from '@/components/List/List';
import { usePaginatedQuery } from '@/queries/usePaginatedQuery';
import { InquireApi } from '@/app/api/InquireApi';
import { InquireList } from '@/types/Inquire';
import { ROUTES } from '@/constants/routes';
import InquireTable from '@/app/(primary)/inquire/_components/InquireTable';

const SERVICE_TYPE_MAP = {
  service: '서비스',
  business: '비즈니스',
};

export default function Inquire() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramsType =
    (searchParams.get('type') as keyof typeof SERVICE_TYPE_MAP) || 'service';
  const serviceType = SERVICE_TYPE_MAP[paramsType] || paramsType;
  const { isLogin } = AuthService;
  const { handleLoginModal } = useModalStore();

  const {
    data: inquireList,
    isLoading,
    isFetching,
    targetRef,
  } = usePaginatedQuery<{
    helpList: InquireList[];
    totalCount: number;
  }>({
    queryKey: ['inquireList'],
    queryFn: ({ pageParam }) => {
      return InquireApi.getInquireList({
        cursor: pageParam,
        pageSize: 10,
      });
    },
  });

  const handleItemClick = (helpId: number) => {
    router.push(`/inquire/${helpId}`);
  };

  return (
    <div>
      <SubHeader>
        <SubHeader.Left
          onClick={() => {
            router.back();
          }}
        >
          <Image
            src="/icon/arrow-left-subcoral.svg"
            alt="arrowIcon"
            width={23}
            height={23}
          />
        </SubHeader.Left>
        <SubHeader.Center>{serviceType} 문의 내역</SubHeader.Center>
      </SubHeader>
      <section className="py-8 px-5">
        <List
          isListFirstLoading={isLoading}
          isScrollLoading={isFetching}
          emptyViewText="문의사항이 없습니다."
          isEmpty={!inquireList || inquireList[0].data.totalCount === 0}
        >
          <List.Total
            total={inquireList ? inquireList[0].data.totalCount : 0}
          />
          <List.Section>
            {inquireList && (
              <InquireTable
                inquireList={[
                  ...inquireList.map((list) => list.data.helpList),
                ].flat()}
                onItemClick={handleItemClick}
              />
            )}
          </List.Section>
        </List>
        <div ref={targetRef} />
      </section>
      <section>
        <section className="px-5 fixed bottom-2 left-0 right-0">
          <Button
            onClick={() => {
              if (!isLogin) {
                handleLoginModal();
                return;
              }
              router.push(ROUTES.INQUIRE.REGISTER);
            }}
            btnName="문의하기"
          />
        </section>
      </section>
    </div>
  );
}

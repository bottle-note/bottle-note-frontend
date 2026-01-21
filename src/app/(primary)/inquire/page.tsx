'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { SubHeader } from '@/components/ui/Navigation/SubHeader';
import Button from '@/components/ui/Button/Button';
import { useAuth } from '@/hooks/auth/useAuth';
import useModalStore from '@/store/modalStore';
import List from '@/components/feature/List/List';
import { usePaginatedQuery } from '@/queries/usePaginatedQuery';
import { InquireApi } from '@/api/inquire/inquire.api';
import { ServiceInquireItem } from '@/api/inquire/types';
import { ROUTES } from '@/constants/routes';
import InquireTable from '@/app/(primary)/inquire/_components/InquireTable';
import { INQUIRE_TYPE } from '@/constants/Inquire';

export default function Inquire() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramsType =
    (searchParams.get('type') as keyof typeof INQUIRE_TYPE) || 'service';
  const serviceType = INQUIRE_TYPE[paramsType] || paramsType;
  const { isLoggedIn } = useAuth();
  const { handleLoginModal } = useModalStore();

  const {
    data: inquireList,
    isLoading,
    isFetching,
    targetRef,
  } = usePaginatedQuery<{
    items: ServiceInquireItem[];
    totalCount: number;
  }>({
    queryKey: ['inquireList', paramsType],
    queryFn: ({ pageParam }) => {
      const queryParams = {
        cursor: pageParam,
        pageSize: 10,
      };
      if (paramsType === 'business') {
        return InquireApi.getBusinessInquireList(queryParams);
      } else {
        return InquireApi.getInquireList(queryParams);
      }
    },
  });

  const handleItemClick = (helpId: number) => {
    router.push(`/inquire/${helpId}?type=${paramsType}`);
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
          <List.Section>
            {inquireList && (
              <InquireTable
                inquireList={inquireList.flatMap((list) => list.data.items)}
                onItemClick={handleItemClick}
              />
            )}
          </List.Section>
        </List>
        <div ref={targetRef} />
      </section>
      <section>
        <section className="px-5 fixed-content bottom-7">
          <Button
            onClick={() => {
              if (!isLoggedIn) {
                handleLoginModal();
                return;
              }
              router.push(`${ROUTES.INQUIRE.REGISTER}?type=${paramsType}`);
            }}
            btnName="문의 작성하기"
          />
        </section>
      </section>
    </div>
  );
}

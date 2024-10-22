'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SubHeader } from '@/app/(primary)/_components/SubHeader';
import { Button } from '@/components/Button';
import { AuthService } from '@/lib/AuthService';
import useModalStore from '@/store/modalStore';
import List from '@/components/List/List';
import BoardListItem from '@/components/List/BoardListItem';
import { usePaginatedQuery } from '@/queries/usePaginatedQuery';
import { InquireApi } from '@/app/api/InquireApi';
import { InquireList } from '@/types/Inquire';

export default function Inquire() {
  const router = useRouter();
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

  return (
    <div>
      <SubHeader bgColor="bg-bgGray">
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
        <SubHeader.Center textColor="text-subCoral">
          나의 문의 목록
        </SubHeader.Center>
      </SubHeader>
      <section className="py-8 px-5">
        <List
          isListFirstLoading={isLoading}
          isScrollLoading={isFetching}
          emptyViewText="문의사항이 없습니다."
        >
          <List.Total
            total={inquireList ? inquireList[0].data.totalCount : 0}
          />
          <List.Section>
            {inquireList &&
              [...inquireList.map((list) => list.data.helpList)]
                .flat()
                .map((item: InquireList) => (
                  <BoardListItem
                    key={item.helpId}
                    id={item.helpId}
                    title={item.content}
                    date={item.createAt}
                    type={item.helpStatus}
                  />
                ))}
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
              router.push(`/inquire/register`);
            }}
            btnName="문의하기"
          />
        </section>
      </section>
    </div>
  );
}

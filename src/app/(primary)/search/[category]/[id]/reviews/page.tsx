'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ReviewApi } from '@/app/api/ReviewApi';
import { SubHeader } from '@/app/(primary)/_components/SubHeader';
import { Review as ReviewType } from '@/types/Review';
import Review from '@/app/(primary)/search/[category]/[id]/_components/Review';
import { truncStr } from '@/utils/truncStr';
import { Button } from '@/components/Button';
import List from '@/components/List/List';
import { SORT_TYPE, SORT_ORDER } from '@/types/common';
import { usePaginatedQuery } from '@/queries/usePaginatedQuery';
import { useFilter } from '@/hooks/useFilter';
import useModalStore from '@/store/modalStore';

const SORT_OPTIONS = [
  { name: '인기도순', type: SORT_TYPE.POPULAR },
  { name: '별점순', type: SORT_TYPE.RATING },
  { name: '병 가격 순', type: SORT_TYPE.BOTTLE_PRICE },
  { name: '잔 가격 순', type: SORT_TYPE.GLASS_PRICE },
];

interface InitialState {
  sortType: SORT_TYPE.POPULAR;
  sortOrder: SORT_ORDER.DESC;
}

function Reviews() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const alcoholId = params?.id;
  const alcoholKorName = searchParams.get('name');
  const { handleLoginModal } = useModalStore();
  const [activeTab, setActiveTab] = useState('tab1');

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  const initialState: InitialState = {
    sortType: SORT_TYPE.POPULAR,
    sortOrder: SORT_ORDER.DESC,
  };

  const { state: filterState, handleFilter } = useFilter(initialState);

  const {
    data: reviewList,
    isLoading: isFirstLoading,
    isFetching,
    targetRef,
  } = usePaginatedQuery<{
    reviewList: ReviewType[];
    totalCount: number;
  }>({
    queryKey: ['review', filterState, alcoholId],
    queryFn: ({ pageParam }) => {
      return ReviewApi.getReviewList({
        alcoholId: alcoholId as string,
        ...filterState,
        cursor: pageParam,
        pageSize: 10,
      });
    },
  });

  const { state: filterMyState, handleFilter: handleMyFilter } =
    useFilter(initialState);

  const {
    data: myReviewList,
    isLoading: isMyReviewFirstLoading,
    isFetching: isMyReviewFetching,
    targetRef: myReviewTargetRef,
  } = usePaginatedQuery<{
    reviewList: ReviewType[];
    totalCount: number;
  }>({
    queryKey: ['myReview', filterMyState],
    queryFn: ({ pageParam }) => {
      return ReviewApi.getMyReviewList({
        alcoholId: alcoholId as string,
        ...filterMyState,
        cursor: pageParam,
        pageSize: 10,
      });
    },
  });

  return (
    <>
      <div className="pb-8 relative">
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
            {alcoholKorName && truncStr(alcoholKorName, 12)}
          </SubHeader.Center>
        </SubHeader>
        <section className="p-8 space-y-9">
          <div className="flex gap-3 relative">
            <button
              className={`py-2 ${activeTab === 'tab1' ? 'tab-selected' : 'tab-default'} w-full font-bold text-15 text-center`}
              onClick={() => handleTabClick('tab1')}
            >
              모든 리뷰
            </button>
            <button
              className={`py-2 ${activeTab === 'tab2' ? 'tab-selected' : 'tab-default'} w-full font-bold text-15 text-center`}
              onClick={() => handleTabClick('tab2')}
            >
              내가 작성한 리뷰
            </button>
          </div>
          <div>
            {activeTab === 'tab1' && (
              <>
                <List
                  isListFirstLoading={isFirstLoading}
                  isScrollLoading={isFetching}
                >
                  <List.Total
                    total={reviewList ? reviewList[0].data.totalCount : 0}
                  />
                  <List.SortOrderSwitch
                    type={filterState.sortOrder}
                    handleSortOrder={(value) =>
                      handleFilter('sortOrder', value)
                    }
                  />
                  <List.OptionSelect
                    options={SORT_OPTIONS}
                    handleOptionCallback={(value) =>
                      handleFilter('sortType', value)
                    }
                  />
                  <List.Section>
                    {reviewList &&
                      [...reviewList.map((list) => list.data.reviewList)]
                        .flat()
                        .map((item: ReviewType) => (
                          <Review
                            data={item}
                            key={item.reviewId + item.userId}
                          />
                        ))}
                  </List.Section>
                </List>
                <div ref={targetRef} />
              </>
            )}

            {activeTab === 'tab2' && (
              <>
                <List
                  isListFirstLoading={isMyReviewFirstLoading}
                  isScrollLoading={isMyReviewFetching}
                >
                  <List.Total
                    total={myReviewList ? myReviewList[0].data.totalCount : 0}
                  />
                  <List.SortOrderSwitch
                    type={filterMyState.sortOrder}
                    handleSortOrder={(value) =>
                      handleMyFilter('sortOrder', value)
                    }
                  />
                  <List.OptionSelect
                    options={SORT_OPTIONS}
                    handleOptionCallback={(value) =>
                      handleMyFilter('sortType', value)
                    }
                  />
                  <List.Section>
                    {myReviewList &&
                      [...myReviewList.map((list) => list.data.reviewList)]
                        .flat()
                        .map((item: ReviewType) => (
                          <Review
                            data={item}
                            key={item.reviewId + item.userId}
                          />
                        ))}
                  </List.Section>
                </List>
                <div ref={myReviewTargetRef} />
              </>
            )}
          </div>
        </section>
        <section className="px-5 fixed bottom-2 left-0 right-0">
          <Button
            onClick={() => {
              if (!session || !alcoholId) {
                handleLoginModal();
                return;
              }
              router.push(`/review/register?alcoholId=${alcoholId}`);
            }}
            btnName="리뷰 작성"
          />
        </section>
      </div>
    </>
  );
}

export default Reviews;

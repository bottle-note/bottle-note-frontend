'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { SubHeader } from '@/components/ui/Navigation/SubHeader';
import NavLayout from '@/components/ui/Layout/NavLayout';
import SearchContainer from '@/components/feature/Search/SearchContainer';
import { usePaginatedQuery } from '@/queries/usePaginatedQuery';
import { HistoryApi } from '@/app/api/HistoryApi';
import { useHistoryFilterStore } from '@/store/historyFilterStore';
import { UserApi } from '@/app/api/UserApi';
import { HistoryListApi, HistoryListQueryParams } from '@/types/History';
import { RATING_NUM_VALUES, PICKS_STATUS } from '@/constants/history';
import { CurrentUserInfoApi } from '@/types/User';
import TimelineFull from '@/components/domain/history/TimelineFull';
import HistoryFilterModal from './_components/filter/HistoryFilterModal';

export default function History() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [currentParams, setCurrentParams] = useState('');
  const [shouldReset, setShouldReset] = useState(false);
  const [currentUserInfo, setCurrentUserInfo] =
    useState<CurrentUserInfoApi | null>(null);

  const { getQueryParams, setKeyword, resetFilter } = useHistoryFilterStore();

  const {
    data: historyData,
    isLoading,
    error,
    isFetching,
    targetRef,
    refetch,
  } = usePaginatedQuery<HistoryListApi>({
    queryKey: ['history', currentUserInfo?.id, currentParams],
    queryFn: async ({ pageParam }) => {
      const queryParams: HistoryListQueryParams = {
        userId: String(currentUserInfo?.id),
        cursor: pageParam,
        pageSize: 10,
      };

      const params = getQueryParams();
      const urlParams = new URLSearchParams();

      for (const [key, value] of params.entries()) {
        if (value === 'ALL') {
          switch (key) {
            case 'ratingPoint':
              RATING_NUM_VALUES.forEach((rating) =>
                urlParams.append(key, rating),
              );
              break;

            case 'picksStatus':
              Object.values(PICKS_STATUS).forEach((status) =>
                urlParams.append(key, status),
              );
              break;

            default:
              urlParams.append(key, value);
          }
        } else {
          urlParams.append(key, value);
        }
      }

      return HistoryApi.getHistoryList(queryParams, urlParams.toString());
    },
    enabled: !!currentUserInfo?.id,
  });

  const accumulatedHistories = historyData?.reduce(
    (acc, page) => ({
      ...page.data,
      userHistories: [
        ...(acc?.userHistories || []),
        ...page.data.userHistories,
      ],
    }),
    {} as HistoryListApi,
  );

  const handleFilterChange = async () => {
    const newParams = getQueryParams().toString();
    if (newParams !== currentParams) {
      setCurrentParams(newParams);
      await refetch();
    }
  };

  const handleClose = async () => {
    setIsOpen(false);
    await handleFilterChange();
  };

  const handleSearchCallback = async (keyword: string) => {
    setKeyword(keyword);
    await handleFilterChange();
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      const userInfo = await UserApi.getCurUserInfo();
      setCurrentUserInfo(userInfo);
    };

    fetchUserInfo();
  }, []);

  const handleReset = () => {
    resetFilter();
    setShouldReset(true);
  };

  useEffect(() => {
    return () => {
      setIsOpen(false);
      setCurrentParams('');
      handleReset();

      queryClient.removeQueries({
        queryKey: ['history'],
      });
    };
  }, [resetFilter, queryClient]);

  return (
    <NavLayout>
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
        <SubHeader.Center>나의 히스토리</SubHeader.Center>
        <SubHeader.Right>
          <SubHeader.Menu />
        </SubHeader.Right>
      </SubHeader>
      <main>
        <SearchContainer
          placeholder="위스키 이름 검색"
          handleSearchCallback={handleSearchCallback}
          styleProps="px-5"
        />
        <TimelineFull
          data={accumulatedHistories}
          isLastPage={
            !!(historyData && !historyData.at(-1)?.meta.pageable?.hasNext)
          }
          currentUserInfo={currentUserInfo}
          handleOpenFilterModal={() => setIsOpen(true)}
          shouldReset={shouldReset}
          onResetComplete={() => setShouldReset(false)}
          targetRef={targetRef}
          isLoading={isLoading}
          isFetching={isFetching}
          error={error}
        />
      </main>
      <HistoryFilterModal isOpen={isOpen} onClose={handleClose} />
    </NavLayout>
  );
}

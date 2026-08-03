'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import CategorySelector from '@/components/ui/Form/CategorySelector';
import List from '@/components/feature/List/List';
import { useHomeFeaturedQuery } from '@/queries/useHomeFeaturedQuery';
import { SORT_TYPE } from '@/api/_shared/types';
import { Category } from '@/types/common';
import { usePaginatedQuery } from '@/queries/usePaginatedQuery';
import { AlcoholsApi } from '@/api/alcohol/alcohol.api';
import { Alcohol } from '@/api/alcohol/types';
import { useRegionsQuery } from '@/queries/useRegionsQuery';
import PrimaryLinkButton from '@/components/ui/Button/PrimaryLinkButton';
import useModalStore from '@/store/modalStore';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import { useTab } from '@/hooks/useTab';
import Tab from '@/components/ui/Navigation/Tab';
import { ROUTES } from '@/constants/routes';
import ListItemSkeleton from '@/components/ui/Loading/Skeletons/ListItemSkeleton';
import { SearchHistoryService } from '@/lib/SearchHistoryService';
import SearchBarLink from '@/components/feature/Search/SearchBarLink';
import { trackGA4Event } from '@/utils/analytics/ga4';
import { useSearchPageState } from '@/app/(primary)/search/hook/useSearchPageState';
import { useCurationDetailQuery } from '@/queries/useCurationDetailQuery';
import { TastingEventLineupItem } from '@/app/(primary)/curation/_components/TastingEventLineupItem';
import { getCurationAlcohols } from '@/app/(primary)/search/_utils/getCurationAlcohols';

const SORT_OPTIONS = [
  { name: '인기도순', type: SORT_TYPE.POPULAR },
  { name: '별점순', type: SORT_TYPE.RATING },
  { name: '찜하기순', type: SORT_TYPE.PICK },
  { name: '댓글순', type: SORT_TYPE.REVIEW },
];

export default function Search() {
  const router = useRouter();
  const { isLoggedIn } = useAuthSession();
  const { data: featuredList = [], isLoading: isFeaturedLoading } =
    useHomeFeaturedQuery({ type: 'week' });
  const { filterState, handleFilter, isEmptySearch, urlKeyword } =
    useSearchPageState();
  const { regionOptions } = useRegionsQuery();
  const [showTab, setShowTab] = useState(true);

  const curationId = filterState.curationId;
  const isCurationSearch =
    Boolean(curationId) && !Number.isNaN(Number(curationId));
  const {
    data: curation,
    isLoading: isCurationLoading,
    isError: isCurationError,
  } = useCurationDetailQuery(isCurationSearch ? curationId : undefined);
  const curationAlcohols = useMemo(
    () => (curation ? getCurationAlcohols(curation) : []),
    [curation],
  );

  const {
    data: alcoholList,
    isLoading: isAlcoholListLoading,
    isFetching: isAlcoholListFetching,
    targetRef,
    error: alcoholListError,
  } = usePaginatedQuery<{
    alcohols: Alcohol[];
    totalCount: number;
  }>({
    queryKey: [
      'search',
      filterState.category,
      filterState.regionId,
      filterState.sortType,
      filterState.sortOrder,
      filterState.keyword,
      filterState.curationId,
    ],
    queryFn: async ({ pageParam }) => {
      return AlcoholsApi.getList({
        ...filterState,
        regionId:
          filterState.regionId === '' ? '' : Number(filterState.regionId),
        cursor: pageParam,
        pageSize: 10,
      });
    },
    staleTime: 0,
    enabled: !isCurationSearch,
  });
  const isFirstLoading = isCurationSearch
    ? isCurationLoading
    : isAlcoholListLoading;
  const isFetching = isCurationSearch
    ? isCurationLoading
    : isAlcoholListFetching;
  const isError = isCurationSearch ? isCurationError : !!alcoholListError;
  const totalCount = isCurationSearch
    ? curationAlcohols.length
    : alcoholList?.[0]?.data.totalCount ?? 0;

  const { handleModalState, handleCloseModal, handleLoginState } =
    useModalStore();

  const handleClickInquire = () => {
    handleModalState({
      isShowModal: true,
      type: 'CONFIRM',
      mainText: '위스키 추가 요청을 하겠습니까?',
      subText: '문의글을 작성하여 위스키를 요청할까요?',
      handleConfirm: () => {
        if (!isLoggedIn) {
          handleCloseModal();
          handleLoginState(true, ROUTES.INQUIRE.REGISTER);
          return;
        }
        handleCloseModal();
        router.push(ROUTES.INQUIRE.REGISTER);
      },
    });
  };

  const handleCategoryCallback = (selectedCategory: Category) => {
    handleFilter('category', selectedCategory);
  };

  const {
    currentTab: categorySelectedTab,
    handleTab: handelCategory,
    tabList: categoryList,
  } = useTab({
    tabList: [{ id: 'category', name: '카테고리' }],
    scroll: true,
  });

  const {
    currentTab: popularSelectedTab,
    handleTab: handelPopular,
    tabList: popularTabList,
  } = useTab({
    tabList: [{ id: 'week', name: 'HOT 5' }],
    scroll: true,
  });

  useEffect(() => {
    if (urlKeyword && urlKeyword.trim() !== '') {
      const searchHistory = new SearchHistoryService();
      searchHistory.save(urlKeyword);
    }
  }, [urlKeyword]);

  useEffect(() => {
    if (urlKeyword && alcoholList && !isFirstLoading) {
      trackGA4Event('search', {
        search_term: urlKeyword,
        result_count: alcoholList[0]?.data.totalCount ?? 0,
      });
    }
  }, [urlKeyword, isFirstLoading]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setShowTab(false);
      } else {
        setShowTab(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Suspense>
      <main className="mb-24 w-full h-full">
        {/* 고정 영역: SearchBar + (스크롤 시) CategorySelector */}
        <div className="fixed-content top-0 bg-white z-10">
          <SearchBarLink
            className="px-5 pt-safe-header"
            placeholder="어떤 술을 찾고 계신가요?"
            keyword={urlKeyword || undefined}
            onClear={() => router.replace('/search/input')}
          />

          {!showTab && (
            <div className="px-5 pt-3 pb-3">
              <CategorySelector
                handleCategoryCallback={handleCategoryCallback}
              />
            </div>
          )}
        </div>

        {/* 스크롤 영역 */}
        <section
          className="flex flex-col gap-7 pb-5"
          style={{
            paddingTop:
              'calc(var(--header-height-with-safe) + var(--search-fixed-area-height))',
          }}
        >
          {showTab && (
            <article className="space-y-4">
              <Tab
                variant="bookmark"
                tabList={categoryList}
                handleTab={handelCategory}
                currentTab={categorySelectedTab}
              />
              <div className="pl-5">
                <CategorySelector
                  handleCategoryCallback={handleCategoryCallback}
                />
              </div>
            </article>
          )}

          {isEmptySearch ? (
            <>
              <Tab
                variant="bookmark"
                tabList={popularTabList}
                handleTab={handelPopular}
                currentTab={popularSelectedTab}
              />
              <section className="px-5">
                {isFeaturedLoading ? (
                  <div className="flex flex-col gap-2">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <ListItemSkeleton key={index} />
                    ))}
                  </div>
                ) : (
                  <List>
                    {featuredList.map((item: Alcohol) => (
                      <List.Item key={item.alcoholId} data={item} />
                    ))}
                  </List>
                )}
              </section>
            </>
          ) : (
            <section className="px-5">
              <List
                isListFirstLoading={isFirstLoading}
                isScrollLoading={isFetching}
                isError={isError}
              >
                <List.Total total={totalCount} />
                {!isCurationSearch && (
                  <List.SortOrderSwitch
                    type={filterState.sortOrder}
                    handleSortOrder={(value) =>
                      handleFilter('sortOrder', value)
                    }
                  />
                )}
                {!isCurationSearch && (
                  <List.OptionSelect
                    options={SORT_OPTIONS}
                    currentValue={filterState.sortType}
                    handleOptionCallback={(value) =>
                      handleFilter('sortType', value)
                    }
                  />
                )}
                {!isCurationSearch && (
                  <List.OptionSelect
                    options={regionOptions}
                    currentValue={filterState.regionId}
                    handleOptionCallback={(value) =>
                      handleFilter('regionId', value)
                    }
                    title="국가"
                  />
                )}

                {isCurationSearch ? (
                  <List.Section className="mt-4 divide-y divide-stroke-neutral-basement border-t border-stroke-neutral-basement">
                    {curationAlcohols.map((item, index) => (
                      <TastingEventLineupItem
                        key={
                          item.alcohol.alcoholId != null
                            ? `alcohol-${item.alcohol.alcoholId}`
                            : `manual-${item.alcohol.korName}-${item.alcohol.engName ?? ''}`
                        }
                        item={item}
                        order={index + 1}
                      />
                    ))}
                  </List.Section>
                ) : (
                  alcoholList &&
                  [...alcoholList.map((list) => list.data.alcohols)]
                    .flat()
                    .map((item: Alcohol) => (
                      <List.Item key={item.alcoholId} data={item} />
                    ))
                )}
              </List>

              {!isCurationSearch && <div ref={targetRef} />}
            </section>
          )}

          {!isEmptySearch && (
            <div className="px-5">
              <PrimaryLinkButton
                data={{
                  engName: 'NO RESULTS',
                  korName: '혹시 찾는 술이 없으신가요?',
                  linkSrc: `/inquire/register`,
                  icon: true,
                  handleBeforeRouteChange: (e) => {
                    e.preventDefault();
                    handleClickInquire();
                  },
                }}
              />
            </div>
          )}
        </section>
      </main>
    </Suspense>
  );
}

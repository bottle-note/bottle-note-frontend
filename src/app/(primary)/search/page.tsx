'use client';

import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuid } from 'uuid';
import CategorySelector from '@/components/ui/Form/CategorySelector';
import List from '@/components/feature/List/List';
import { usePopularList } from '@/hooks/usePopularList';
import { Category, SORT_TYPE } from '@/types/common';
import { usePaginatedQuery } from '@/queries/usePaginatedQuery';
import { AlcoholAPI } from '@/types/Alcohol';
import { AlcoholsApi } from '@/app/api/AlcholsApi';
import { CurationApi } from '@/app/api/CurationApi';
import { REGIONS } from '@/constants/common';
import PrimaryLinkButton from '@/components/ui/Button/PrimaryLinkButton';
import useModalStore from '@/store/modalStore';
import { useAuth } from '@/hooks/auth/useAuth';
import { useTab } from '@/hooks/useTab';
import Tab from '@/components/ui/Navigation/Tab';
import { ROUTES } from '@/constants/routes';
import ListItemSkeleton from '@/components/ui/Loading/Skeletons/ListItemSkeleton';
import { SearchHistoryService } from '@/lib/SearchHistoryService';
import SearchContainer from '@/components/feature/Search/SearchContainer';
import { useSearchPageState } from '@/app/(primary)/search/hook/useSearchPageState';

const SORT_OPTIONS = [
  { name: '인기도순', type: SORT_TYPE.POPULAR },
  { name: '별점순', type: SORT_TYPE.RATING },
  { name: '찜하기순', type: SORT_TYPE.PICK },
  { name: '댓글순', type: SORT_TYPE.REVIEW },
];

const CURATION_KEYWORDS = ['겨울 추천 위스키', '비 오는 날 추천 위스키'];

const isCurationKeyword = (keyword: string) => {
  return CURATION_KEYWORDS.some((curationKeyword) =>
    keyword.includes(curationKeyword),
  );
};

export default function Search() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { popularList, isLoading: isPopularLoading } = usePopularList();
  const { filterState, handleFilter, isEmptySearch, urlKeyword } =
    useSearchPageState();

  const isCurationSearch =
    filterState.keyword && isCurationKeyword(filterState.keyword);

  const {
    data: alcoholList,
    isLoading: isFirstLoading,
    isFetching,
    targetRef,
    error,
  } = usePaginatedQuery<{
    alcohols: AlcoholAPI[];
    totalCount: number;
  }>({
    queryKey: [
      'search',
      filterState.category,
      filterState.regionId,
      filterState.sortType,
      filterState.sortOrder,
      filterState.keyword,
    ],
    queryFn: async ({ pageParam }) => {
      if (isCurationSearch) {
        const curationsResult = await CurationApi.getCurations({
          keyword: filterState.keyword,
          cursor: 0,
          pageSize: 1,
        });

        if (curationsResult.data.items.length > 0) {
          const curationId = curationsResult.data.items[0].id;
          const alcoholsResult = await CurationApi.getAlcoholsByCurationId(
            curationId,
            {
              cursor: pageParam,
              pageSize: 10,
            },
          );

          // CurationAlcoholItem을 AlcoholAPI로 변환
          const alcohols: AlcoholAPI[] = alcoholsResult.data.items.map(
            ({
              korCategoryName,
              engCategoryName,
              reviewCount,
              pickCount,
              ...rest
            }) => ({
              ...rest,
              korCategory: korCategoryName,
              engCategory: engCategoryName,
              popularScore: 0,
            }),
          );

          return {
            data: {
              alcohols,
              totalCount: alcoholsResult.data.items.length,
            },
            errors: [],
            success: true,
            code: 200,
            meta: alcoholsResult.meta,
          };
        }
      }

      // 일반 검색인 경우 기존 API 사용
      return AlcoholsApi.getList({
        ...filterState,
        category: filterState.category === 'ALL' ? '' : filterState.category,
        regionId:
          filterState.regionId === '' ? '' : Number(filterState.regionId),
        ...{
          cursor: pageParam,
          pageSize: 10,
        },
      });
    },
    staleTime: 0,
  });

  const { handleModalState, handleCloseModal, handleLoginModal } =
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
          handleLoginModal();
          return;
        }
        handleCloseModal();
        router.push(ROUTES.INQUIRE.REGISTER);
      },
    });
  };

  const handleSearchCallback = (searchedKeyword: string) => {
    handleFilter('keyword', searchedKeyword);
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

  return (
    <Suspense>
      <main className="mb-24 w-full h-full">
        <SearchContainer
          handleSearchCallback={handleSearchCallback}
          styleProps="px-5 pt-[70px]"
        />

        <section className="flex flex-col gap-7 pt-[11px] pb-5">
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

          {isEmptySearch ? (
            <>
              <Tab
                variant="bookmark"
                tabList={popularTabList}
                handleTab={handelPopular}
                currentTab={popularSelectedTab}
              />
              <section className="px-5">
                {isPopularLoading ? (
                  <div className="flex flex-col gap-2">
                    {Array.from({ length: 5 }).map(() => (
                      <ListItemSkeleton key={uuid()} />
                    ))}
                  </div>
                ) : (
                  <List>
                    {popularList.map((item: AlcoholAPI) => (
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
                isError={!!error}
              >
                <List.Total
                  total={alcoholList ? alcoholList[0].data.totalCount : 0}
                />
                {!isCurationSearch && (
                  <>
                    <List.SortOrderSwitch
                      type={filterState.sortOrder}
                      handleSortOrder={(value) =>
                        handleFilter('sortOrder', value)
                      }
                    />
                    <List.OptionSelect
                      options={SORT_OPTIONS}
                      currentValue={filterState.sortType}
                      handleOptionCallback={(value) =>
                        handleFilter('sortType', value)
                      }
                    />
                    <List.OptionSelect
                      options={REGIONS.map((region) => ({
                        type: String(region.regionId),
                        name: region.korName,
                      }))}
                      currentValue={filterState.regionId}
                      handleOptionCallback={(value) =>
                        handleFilter('regionId', value)
                      }
                      title="국가"
                    />
                  </>
                )}

                {alcoholList &&
                  [...alcoholList.map((list) => list.data.alcohols)]
                    .flat()
                    .map((item: AlcoholAPI) => (
                      <List.Item key={uuid()} data={item} />
                    ))}
              </List>

              <div ref={targetRef} />
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

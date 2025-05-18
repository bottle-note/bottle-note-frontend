'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { v4 as uuid } from 'uuid';
import CategorySelector from '@/components/CategorySelector';
import List from '@/components/List/List';
import { usePopularList } from '@/hooks/usePopularList';
import { Category, RegionId, SORT_ORDER, SORT_TYPE } from '@/types/common';
import { useFilter } from '@/hooks/useFilter';
import { usePaginatedQuery } from '@/queries/usePaginatedQuery';
import { AlcoholAPI } from '@/types/Alcohol';
import { AlcoholsApi } from '@/app/api/AlcholsApi';
import { REGIONS } from '@/constants/common';
import LinkButton from '@/components/LinkButton';
import useModalStore from '@/store/modalStore';
import Modal from '@/components/Modal';
import { AuthService } from '@/lib/AuthService';
import { useTab } from '@/hooks/useTab';
import Tab from '@/components/Tab';
import SearchContainer from '../../../components/Search/SearchContainer';
import { ROUTES } from '@/constants/routes';

interface InitialState {
  keyword: string;
  category: Category;
  regionId: RegionId;
  sortType: SORT_TYPE;
  sortOrder: SORT_ORDER;
}

export default function Search() {
  const router = useRouter();
  const { popularList } = usePopularList();
  const { isLogin } = AuthService;
  const currCategory = useSearchParams().get('category') as Category;
  const currSearchKeyword = useSearchParams().get('query');
  const isEmptySearch = currCategory === null && currSearchKeyword === null;

  const initialState: InitialState = {
    category: currCategory || '',
    keyword: currSearchKeyword || '',
    regionId: '',
    sortType: SORT_TYPE.POPULAR,
    sortOrder: SORT_ORDER.DESC,
  };

  const { state: filterState, handleFilter } = useFilter(initialState);

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
    queryFn: ({ pageParam }) => {
      return AlcoholsApi.getList({
        ...filterState,
        ...{
          cursor: pageParam,
          pageSize: 10,
        },
      });
    },
    staleTime: 1000 * 60 * 5,
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
        if (!isLogin) {
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
    router.replace(
      `/search?category=${currCategory ?? ''}&query=${searchedKeyword ?? ''}`,
    );
  };

  const handleCategoryCallback = (selectedCategory: Category) => {
    handleFilter('category', selectedCategory);
    router.replace(
      `/search?category=${selectedCategory}&query=${currSearchKeyword ?? ''}`,
    );
  };

  const SORT_OPTIONS = [
    { name: '인기도순', type: SORT_TYPE.POPULAR },
    { name: '별점순', type: SORT_TYPE.RATING },
    { name: '찜하기순', type: SORT_TYPE.PICK },
    { name: '댓글순', type: SORT_TYPE.REVIEW },
  ];

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
    tabList: PopularList,
  } = useTab({
    tabList: [{ id: 'week', name: 'HOT 5' }],
    scroll: true,
  });

  return (
    <Suspense>
      <main className="mb-24 w-full h-full">
        <SearchContainer
          handleSearchCallback={handleSearchCallback}
          styleProps="px-5 pt-16 pb-5 bg-subCoral"
        />

        <section className="flex flex-col gap-7 py-5">
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
                tabList={PopularList}
                handleTab={handelPopular}
                currentTab={popularSelectedTab}
              />
              <section className="px-5">
                <List>
                  {popularList.map((item: AlcoholAPI) => (
                    <List.Item
                      key={item.alcoholId}
                      data={{
                        ...item,
                      }}
                    />
                  ))}
                </List>
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
                <List.SortOrderSwitch
                  type={filterState.sortOrder}
                  handleSortOrder={(value) => handleFilter('sortOrder', value)}
                />
                <List.OptionSelect
                  options={SORT_OPTIONS}
                  handleOptionCallback={(value) =>
                    handleFilter('sortType', value)
                  }
                />
                <List.OptionSelect
                  options={REGIONS.map((region) => ({
                    type: String(region.regionId),
                    name: region.korName,
                  }))}
                  handleOptionCallback={(value) =>
                    handleFilter('regionId', value)
                  }
                  title="국가"
                />

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
              <LinkButton
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

      <Modal />
    </Suspense>
  );
}

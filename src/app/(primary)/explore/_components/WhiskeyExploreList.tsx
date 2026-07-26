import { useRouter } from 'next/navigation';
import { ExploreApi } from '@/api/explore/explore.api';
import type { ExploreAlcohol } from '@/api/explore/types';
import { usePaginatedQuery } from '@/queries/usePaginatedQuery';
import List from '@/components/feature/List/List';
import PrimaryLinkButton from '@/components/ui/Button/PrimaryLinkButton';
import { useAuth } from '@/hooks/auth/useAuth';
import useModalStore from '@/store/modalStore';
import { ROUTES } from '@/constants/routes';
import WhiskeyListItem from './WhiskeyListItem';
import { ExploreSearchBar } from './ExploreSearchBar';
import { useExploreFilters } from '../_hooks/useExploreFilters';
import { useWhiskeyExploreSearch } from '../_hooks/useWhiskeyExploreSearch';

interface WhiskeyExplorerListProps {
  isSearchActive: boolean;
  onSearchActiveChange: (active: boolean) => void;
}

export const WhiskeyExplorerList = ({
  isSearchActive,
  onSearchActiveChange,
}: WhiskeyExplorerListProps) => {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { handleModalState, handleCloseModal, handleLoginState } =
    useModalStore();
  const { inputKeyword, debouncedKeyword, isTyping, setInputKeyword } =
    useWhiskeyExploreSearch();
  const { regionIds, category } = useExploreFilters();

  const {
    data: alcoholList,
    isLoading: isFirstLoading,
    isFetching,
    isFetchingNextPage,
    isPlaceholderData,
    hasNextPage,
    targetRef,
    error,
  } = usePaginatedQuery<{
    items: ExploreAlcohol[];
  }>({
    queryKey: [
      'explore.alcohols',
      category || 'all',
      regionIds.join(',') || 'all',
      debouncedKeyword,
    ],
    queryFn: ({ pageParam, signal }) => {
      return ExploreApi.getAlcohols({
        keywords: debouncedKeyword ? [debouncedKeyword] : [],
        regionIds: regionIds.length > 0 ? regionIds : undefined,
        category: category || undefined,
        sortType: 'POPULAR',
        sortOrder: 'DESC',
        cursor: pageParam,
        pageSize: 10,
        signal,
      });
    },
    staleTime: 1000 * 60 * 5,
    keepPreviousData: true,
  });

  const isSearching = isFetching && !isFetchingNextPage;
  const isEmpty =
    !error &&
    !isTyping &&
    !isSearching &&
    !isPlaceholderData &&
    (!alcoholList || alcoholList[0]?.data.items.length === 0);

  const alcoholCount =
    alcoholList?.reduce(
      (count, listData) => count + listData.data.items.length,
      0,
    ) ?? 0;
  const hasReachedEnd =
    !isFirstLoading &&
    !isFetching &&
    !isPlaceholderData &&
    !error &&
    alcoholList !== undefined &&
    hasNextPage === false;
  const showInquireButton = isEmpty || (hasReachedEnd && alcoholCount > 0);

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

  return (
    <section>
      <ExploreSearchBar
        mode="realtime"
        initialValue={inputKeyword}
        onValueChange={setInputKeyword}
        isSearchActive={isSearchActive}
        onSearchActiveChange={onSearchActiveChange}
        description="이름이나 플레이버 태그를 입력해 검색해보세요."
        isFilter
      />
      <div className="border-b border-borderGray" />

      <List
        emptyViewText="조건에 맞는 위스키가 없어요."
        isListFirstLoading={isFirstLoading}
        isError={!!error}
        isScrollLoading={isFetchingNextPage}
        isEmpty={isEmpty}
      >
        <List.Section className="divide-y-[1px]">
          {alcoholList &&
            [...alcoholList].map((listData, pageIndex) =>
              listData.data.items
                .flat()
                .map((data, itemIndex) => (
                  <WhiskeyListItem
                    key={data.alcoholId}
                    content={data}
                    priority={pageIndex === 0 && itemIndex < 4}
                  />
                )),
            )}
        </List.Section>
      </List>
      <div ref={targetRef} />
      {showInquireButton && (
        <div className="pt-7 pb-20">
          <PrimaryLinkButton
            data={{
              engName: 'NO RESULTS',
              korName: '혹시 찾는 술이 없으신가요?',
              linkSrc: ROUTES.INQUIRE.REGISTER,
              icon: true,
              handleBeforeRouteChange: (event) => {
                event.preventDefault();
                handleClickInquire();
              },
            }}
          />
        </div>
      )}
    </section>
  );
};

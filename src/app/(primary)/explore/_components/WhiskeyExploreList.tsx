import Image from 'next/image';
import { ExploreApi } from '@/api/explore/explore.api';
import { ExploreAlcohol } from '@/api/explore/types';
import { usePaginatedQuery } from '@/queries/usePaginatedQuery';
import List from '@/components/feature/List/List';
import Label from '@/components/ui/Display/Label';
import WhiskeyListItem from './WhiskeyListItem';
import { ExploreSearchBar } from './ExploreSearchBar';
import DeleteIcon from 'public/icon/reset-mainGray.svg';
import { useExploreKeywords } from '../_hooks/useExploreKeywords';

const WHISKEY_TAB_ID = 'EXPLORER_WHISKEY';

export const WhiskeyExplorerList = () => {
  const { keywords, keywordValues, handleAddKeyword, handleRemoveKeyword } =
    useExploreKeywords({ tabId: WHISKEY_TAB_ID });

  const {
    data: alcoholList,
    isLoading: isFirstLoading,
    isFetching,
    targetRef,
    error,
    refetch,
  } = usePaginatedQuery<{
    items: ExploreAlcohol[];
  }>({
    queryKey: ['explore.alcohols', ...keywordValues],
    queryFn: ({ pageParam }) => {
      return ExploreApi.getAlcohols({
        keywords: keywordValues,
        ...{
          cursor: pageParam,
          pageSize: 10,
        },
      });
    },
    staleTime: 1000 * 60 * 5,
  });

  return (
    <section>
      <ExploreSearchBar
        handleSearch={refetch}
        handleAddKeyword={handleAddKeyword}
        handleRemoveKeyword={handleRemoveKeyword}
        description={`이름이나 플레이버 태그를 추가하여 검색해보세요.`}
        activeKeywords={keywords}
        isFilter
      />
      <article className="flex gap-x-1 gap-y-1.5 flex-wrap border-b border-borderGray pb-6">
        {keywords.map((keyword) => (
          <div key={keyword.value} className="overflow-hidden flex-shrink-0">
            <Label
              name={keyword.label}
              styleClass="label-default text-13"
              position="after"
              icon={
                <button
                  type="button"
                  onMouseDown={() => handleRemoveKeyword(keyword.value)}
                  className=""
                  aria-label="검색어 지우기"
                >
                  <Image src={DeleteIcon} alt="delete" />
                </button>
              }
            />
          </div>
        ))}
      </article>

      <List
        isListFirstLoading={isFirstLoading}
        isError={!!error}
        isScrollLoading={isFetching}
        isEmpty={
          !isFirstLoading &&
          (!alcoholList || alcoholList[0]?.data.items.length === 0)
        }
      >
        <List.Section className="divide-y-[1px]">
          {alcoholList &&
            [...alcoholList].map((listdata, pageIndex) =>
              listdata.data.items
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
    </section>
  );
};

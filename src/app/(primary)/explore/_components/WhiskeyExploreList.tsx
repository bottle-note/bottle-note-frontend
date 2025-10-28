import { useState } from 'react';
import Image from 'next/image';
import { v4 as uuid } from 'uuid';
import { ExploreApi } from '@/app/api/ExploreApi';
import { ExploreAlcohol } from '@/types/Explore';
import { usePaginatedQuery } from '@/queries/usePaginatedQuery';
import List from '@/components/feature/List/List';
import Label from '@/components/ui/Display/Label';
import WhiskeyListItem from './WhiskeyListItem';
import { SearchBar, type SearchKeyword } from './SearchBar';
import DeleteIcon from 'public/icon/reset-mainGray.svg';

export const WhiskeyExplorerList = () => {
  const [keywords, setKeywords] = useState<SearchKeyword[]>([]);
  const keywordValues = keywords.map((keyword) => keyword.value);

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

  const handleSearch = () => {
    refetch();
  };

  const handleAddKeyword = (newKeyword: SearchKeyword) => {
    setKeywords((prev) => {
      if (prev.some((keyword) => keyword.value === newKeyword.value)) {
        return prev;
      }

      return [...prev, newKeyword];
    });
  };

  const handleRemoveKeyword = (keywordValueToRemove: string) => {
    setKeywords((prev) =>
      prev.filter((keyword) => keyword.value !== keywordValueToRemove),
    );
  };

  return (
    <section>
      <SearchBar
        handleSearch={handleSearch}
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
            [...alcoholList].map((listdata) =>
              listdata.data.items
                .flat()
                .map((data) => <WhiskeyListItem key={uuid()} content={data} />),
            )}
        </List.Section>
      </List>
      <div ref={targetRef} />
    </section>
  );
};

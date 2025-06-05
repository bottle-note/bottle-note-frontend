import { useState } from 'react';
import Image from 'next/image';
import { v4 as uuid } from 'uuid';
import { ExploreApi } from '@/app/api/ExploreApi';
import { ExploreAlcohol } from '@/types/Explore';
import { usePaginatedQuery } from '@/queries/usePaginatedQuery';
import List from '@/components/List/List';
import WhiskeyListItem from './WhiskeyListItem';
import { SearchBar } from './SearchBar';
import DeleteIcon from 'public/icon/reset-mainGray.svg';
import Label from '../../_components/Label';

export const WhiskeyExplorerList = () => {
  const [keywords, setKeywords] = useState<Set<string>>(new Set());

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
    queryKey: ['explore.alcohols', keywords],
    queryFn: ({ pageParam }) => {
      return ExploreApi.getAlcohols({
        keywords: Array.from(keywords),
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

  const handleAddKeyword = (newKeyword: string) => {
    setKeywords((prev) => new Set(prev).add(newKeyword));
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setKeywords((prev) => {
      const newSet = new Set(prev);
      newSet.delete(keywordToRemove);
      return newSet;
    });
  };

  return (
    <section>
      <SearchBar
        handleSearch={handleSearch}
        handleAddKeyword={handleAddKeyword}
        handleRemoveKeyword={handleRemoveKeyword}
        description={`이름이나 플레이버 태그를 추가하여 검색해보세요.`}
      />
      <article className="flex gap-x-1 gap-y-1.5 flex-wrap border-b border-borderGray pb-6">
        {Array.from(keywords).map((keyword) => (
          <div key={keyword} className="overflow-hidden flex-shrink-0">
            <Label
              name={keyword}
              styleClass="label-default text-12"
              position="after"
              icon={
                <button
                  type="button"
                  onMouseDown={() => handleRemoveKeyword(keyword)}
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
            alcoholList[0].data.items.map((data) => (
              <WhiskeyListItem key={uuid()} content={data} />
            ))}
        </List.Section>
        <div ref={targetRef} />
      </List>
    </section>
  );
};

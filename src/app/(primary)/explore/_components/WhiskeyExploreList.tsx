import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import { ExploreApi } from '@/app/api/ExploreApi';
import { ExploreAlcohol } from '@/types/Explore';
import { usePaginatedQuery } from '@/queries/usePaginatedQuery';
import List from '@/components/List/List';
import WhiskeyListItem from './WhiskeyListItem';

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

  return (
    <section>
      <List
        isListFirstLoading={isFirstLoading}
        isError={!!error}
        isScrollLoading={isFetching}
        isEmpty={
          !isFirstLoading &&
          (!alcoholList || alcoholList[0]?.data.items.length === 0)
        }
      >
        <List.Section className="space-y-[30px] divide-y-[1px]">
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

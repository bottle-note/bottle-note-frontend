import { filterChildComponent } from '@/utils/filterChildComponent';
import ListItem from './ListItem';
import ListItemRating from './ListItemRating';
import Total from './Total';
import SortOrderToggle from './SortOrderToggle';
import OptionSelect from './OptionSelect';
import Title from './Title';
import EmptyView from '@/app/(primary)/_components/EmptyView';
import Loading from '../Loading';
import { Children } from 'react';

interface ListMainProps {
  children: React.ReactNode;
  emptyViewText?: string;
  isListFirstLoading?: boolean;
  isScrollLoading?: boolean;
}

// TODO: 여러 종류의 리스트 아이템을 렌더링 할 수 있으면서, emptyView 에 대한 처리도 유연하게 할 수 있도록 개선 필요
const ListMain = ({
  children,
  emptyViewText,
  isListFirstLoading,
}: ListMainProps) => {
  const title = filterChildComponent(children, Title);
  const totalDisplay = filterChildComponent(children, Total);
  const sortOrderToggle = filterChildComponent(children, SortOrderToggle);
  const optionSelect = filterChildComponent(children, OptionSelect);
  const items = filterChildComponent(children, ListItem);
  const ratingItems = filterChildComponent(children, ListItemRating);

  const filteredChildren = Children.toArray(children).filter((child: any) => {
    return ![
      Title,
      Total,
      SortOrderToggle,
      OptionSelect,
      ListItem,
      ListItemRating,
    ].includes(child.type);
  });

  const isEmpty = items.length === 0 && ratingItems.length === 0;
  const isManageExist = Boolean(
    title.length ||
      totalDisplay.length ||
      sortOrderToggle.length ||
      optionSelect.length,
  );

  return (
    <section>
      {isManageExist && (
        <article className="flex justify-between items-center text-mainGray text-sm pb-3.25 border-brightGray border-b">
          <div className="flex gap-1">
            {title}
            {totalDisplay}
          </div>
          <div className="flex gap-1.5 w-full justify-end">
            {sortOrderToggle}
            {optionSelect}
          </div>
        </article>
      )}
      <article>
        {isEmpty ? (
          <EmptyView text={emptyViewText} />
        ) : (
          <>
            {items}
            {ratingItems}
          </>
        )}
        {isListFirstLoading && <Loading />}
        {filteredChildren}
      </article>
    </section>
  );
};

const List = Object.assign(ListMain, {
  Title,
  Total,
  SortOrderToggle,
  OptionSelect,
  Item: ListItem,
  Rating: ListItemRating,
});

export default List;

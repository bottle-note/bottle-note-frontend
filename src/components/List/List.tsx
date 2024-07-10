import { filterChildComponent } from '@/utils/filterChildComponent';
import ListItem from './ListItem';
import ListItemRating from './ListItemRating';
import Total from './Total';
import SortOrderToggle from './SortOrderToggle';
import OptionSelect from './OptionSelect';
import Title from './Title';
import EmptyView from '@/app/(primary)/_components/EmptyView';
import Loading from '../Loading';

interface ListMainProps {
  children: React.ReactNode;
  emptyViewText?: string;
  isListFirstLoading?: boolean;
  isScrollLoading?: boolean;
}

// TODO: children 이외에 다른 아이템도 여기에 포함될 수 있어야 함!
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

  const isEmpty = items.length === 0 && ratingItems.length === 0;

  return (
    <section>
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

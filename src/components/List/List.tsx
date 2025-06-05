import { v4 as uuid } from 'uuid';
import { filterChildComponent } from '@/utils/filterChildComponent';
import EmptyView from '@/app/(primary)/_components/EmptyView';
import ListItemSkeleton from '@/components/Skeletons/ListItemSkeleton';
import ListItem from './ListItem';
import ListItemRating from './ListItemRating';
import Total from './Total';
import SortOrderSwitch from './SortOrderSwitch';
import OptionSelect from './OptionSelect';
import Title from './Title';
import ListSection from './ListSection';

interface ListMainProps {
  children: React.ReactNode;
  emptyViewText?: string;
  isListFirstLoading?: boolean;
  isScrollLoading?: boolean;
  isError?: boolean;
  isEmpty?: boolean;
}

const ListMain = ({
  children,
  emptyViewText,
  isListFirstLoading,
  isError,
  isEmpty,
}: ListMainProps) => {
  const title = filterChildComponent(children, Title);
  const totalDisplay = filterChildComponent(children, Total);
  const sortOrderSwitch = filterChildComponent(children, SortOrderSwitch);
  const optionSelect = filterChildComponent(children, OptionSelect);
  const items = filterChildComponent(children, ListItem);
  const ratingItems = filterChildComponent(children, ListItemRating);
  const listSection: React.ReactNode[] = filterChildComponent(
    children,
    ListSection,
  );

  const isManageExist = Boolean(
    title.length ||
      totalDisplay.length ||
      sortOrderSwitch.length ||
      optionSelect.length,
  );

  return (
    <section>
      {isManageExist && (
        <article className="flex justify-between items-center text-mainGray text-sm pb-2 border-brightGray border-b">
          <div className="flex gap-1">
            {title}
            {totalDisplay}
          </div>
          <div className="flex gap-1.5 w-full justify-end">
            {sortOrderSwitch}
            {optionSelect}
          </div>
        </article>
      )}

      <>
        {isError && (
          <EmptyView
            text={'에러가 발생했습니다.\n잠시 후 다시 시도해주세요.'}
          />
        )}
      </>

      <>
        {isEmpty && !isError && !isListFirstLoading ? (
          <EmptyView text={emptyViewText} />
        ) : (
          <>
            {items}
            {ratingItems}
            {listSection}
          </>
        )}

        {isListFirstLoading && (
          <section className="px-5">
            {Array.from({ length: 5 }).map(() => (
              <ListItemSkeleton key={uuid()} />
            ))}
          </section>
        )}
      </>
    </section>
  );
};

const List = Object.assign(ListMain, {
  Title,
  Total,
  SortOrderSwitch,
  OptionSelect,
  Item: ListItem,
  Rating: ListItemRating,
  Section: ListSection,
});

export default List;

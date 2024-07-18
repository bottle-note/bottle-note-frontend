import { filterChildComponent } from '@/utils/filterChildComponent';
import ListItem from './ListItem';
import ListItemRating from './ListItemRating';
import Total from './Total';
import SortOrderSwitch from './SortOrderSwitch';
import OptionSelect from './OptionSelect';
import Title from './Title';
import EmptyView from '@/app/(primary)/_components/EmptyView';
import Loading from '../Loading';
import { Children } from 'react';
import ListSection from './ListSection';

interface ListMainProps {
  children: React.ReactNode;
  emptyViewText?: string;
  isListFirstLoading?: boolean;
  isScrollLoading?: boolean;
}

const ListMain = ({
  children,
  emptyViewText,
  isListFirstLoading,
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

  const isEmpty =
    !items.length &&
    !ratingItems.length &&
    listSection &&
    !Children.count((listSection[0] as React.ReactElement)?.props?.children);

  const isManageExist = Boolean(
    title.length ||
      totalDisplay.length ||
      sortOrderSwitch.length ||
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
            {sortOrderSwitch}
            {optionSelect}
          </div>
        </article>
      )}

      <>
        {isEmpty ? (
          <EmptyView text={emptyViewText} />
        ) : (
          <>
            {items}
            {ratingItems}
            {listSection}
          </>
        )}

        {isListFirstLoading && <Loading />}
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

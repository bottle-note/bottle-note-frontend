import { filterChildComponent } from '@/utils/filterChildComponent';
import ListItem from './ListItem';
import ListItemRating from './ListItemRating';
import ListManager from './ListManager';
import Total from './Total';
import SortOrderToggle from './SortOrderToggle';
import OptionSelect from './OptionSelect';

interface ListMainProps {
  children: React.ReactNode;
}

// TODO: children 이외에 다른 아이템도 여기에 포함될 수 있어야 함!
const ListMain = ({ children }: ListMainProps) => {
  const totalDisplay = filterChildComponent(children, Total);
  const sortOrderToggle = filterChildComponent(children, SortOrderToggle);
  const optionSelect = filterChildComponent(children, OptionSelect);

  return (
    <section>
      <article className="flex justify-between items-center text-mainGray text-sm pb-3.25 border-mainBlack border-b">
        {totalDisplay}
        <div className="flex gap-1.5 w-full justify-end">
          {sortOrderToggle}
          {optionSelect}
        </div>
      </article>
    </section>
  );
};

const List = Object.assign(ListMain, {
  Total,
  SortOrderToggle,
  OptionSelect,
  Item: ListItem,
  Rating: ListItemRating,
});

export default List;

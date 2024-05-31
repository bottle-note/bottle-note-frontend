import ListItem from './ListItem';
import ListItemRating from './ListItemRating';
import ListManager from './ListManager';

interface ListMainProps {
  children: React.ReactNode;
}

const ListMain = ({ children }: ListMainProps) => {
  return <section>{children}</section>;
};

const List = Object.assign(ListMain, {
  Manager: ListManager,
  Item: ListItem,
  Rating: ListItemRating,
});

export default List;

'use client';

import ListItem from './ListItem';
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
});

export default List;

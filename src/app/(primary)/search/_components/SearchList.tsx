'use client';

import List from '@/components/List/List';

// FIXME: 타입스크립트 적용
interface Props {
  data: any;
}

export default function SearchList({ data }: Props) {
  return (
    <List>
      {data.map((item: any) => (
        <List.Item key={item.whiskyId} data={item} />
      ))}
    </List>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import CategorySelector from '@/components/CategorySelector';
import CategoryTitle from '@/components/CategoryTitle';
import List from '@/components/List/List';
import { usePopular } from '@/hooks/usePopular';

export default function Search() {
  const router = useRouter();
  const { populars, isLoading } = usePopular();
  const currentCategory = 'All';

  const handleCategoryCallback = (value: string) => {
    if (value !== currentCategory) router.push(`/search/${value}`);
  };

  return (
    <main className="flex flex-col gap-7">
      <CategorySelector handleCategoryCallback={handleCategoryCallback} />

      <section>
        <CategoryTitle subTitle="위클리 HOT 5" />

        <List isListFirstLoading={isLoading}>
          {populars.map((item: any) => (
            <List.Item key={item.alcoholId} data={item} />
          ))}
        </List>
      </section>
    </main>
  );
}

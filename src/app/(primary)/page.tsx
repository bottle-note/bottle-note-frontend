import { Suspense } from 'react';
import MenuList from '@/components/MenuList';
import Header from '@/app/(primary)/_components/Header';
import CategoryList from './_components/CategoryList';
import PopularList from './_components/PopularList';
import NavLayout from './_components/NavLayout';

export default function Home() {
  return (
    <Suspense>
      <NavLayout>
        <Header />
        <div className="space-y-1 relative">
          <section className="px-5 pb-20">
            <article className="pt-10 space-y-[18px]">
              <MenuList name="위클리 HOT 5" />
              <PopularList />
            </article>
            <article className="pt-10 space-y-[18px]">
              <MenuList name="카테고리" />
              <CategoryList />
            </article>
          </section>
        </div>
      </NavLayout>
    </Suspense>
  );
}

import CategoryTitle from '@/components/CategoryTitle';
import Header from '@/app/(primary)/_components/Header';
import CategoryList from './_components/CategoryList';
import HotList from './_components/HotList';
import NavLayout from './_components/NavLayout';

export default function Home() {
  return (
    <NavLayout>
      <Header />
      <div className="space-y-1 relative">
        <section className="px-5 pb-20">
          <article className="py-2 pt-5 space-y-3">
            <CategoryTitle subTitle="위클리 HOT 5" />
            <HotList />
            {/* 없을 경우의 화면을 넣어줘야하나? */}
          </article>
          <article className="py-2 pt-5 space-y-3">
            <CategoryTitle subTitle="카테고리" />
            <CategoryList />
          </article>
        </section>
      </div>
    </NavLayout>
  );
}

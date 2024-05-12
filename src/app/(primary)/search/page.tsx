import React from 'react';
import { MOCK_LIST_ITEM } from 'mock/alcohol';
import ListItem from '@/components/ListItem';
import SearchHeader from '../_components/SearchHeader';

export default function Search() {
  // FIXME: 기 정의된 상수 사용하도록 수정 // 카테고리 컴포넌트 분리하면서 같이 옮겨
  const CATEGORIES = [
    '전체',
    '싱글몰트',
    '블렌디드',
    '블렌디드 몰트',
    '아메리카(버번)',
    '라이',
    '기타',
  ];

  return (
    // FIXME: 검색 화면에 스크롤이 생기면 안될 것 같은데...
    <main className="mb-24 w-full h-full">
      <SearchHeader />
      <section className="p-5 space-y-7">
        {/* TODO: 카테고리 컴포넌트 공통컴포넌트화 */}
        <section>
          <div>카테고리</div>
          <article>
            {CATEGORIES.map((value) => {
              return <button key={value}>{value}</button>;
            })}
          </article>
        </section>

        {/* TODO: 리스트 컴포넌트 공통컴포넌트화 && 합성 컴포넌트화 */}
        <section>
          <div>위클리 HOT 5</div>
          <section>
            {MOCK_LIST_ITEM.map((item) => (
              <ListItem key={item.whiskyId} data={item} />
            ))}
          </section>
        </section>
      </section>
    </main>
  );
}

import React from 'react';
import { MOCK_LIST_ITEM } from 'mock/alcohol';
import CategorySelector from '@/components/CategorySelector';
import CategoryTitle from '@/components/CategoryTitle';
import SearchList from './_components/SearchList';
import SearchHeader from '../_components/SearchHeader';

// TODO: it goes like...
// 1. 검색어를 입력 후 확인을 누른다.
// 2. 검색어가 입력 되자마자 최근 검색어가 나타나야 한다.
// 3. 확인을 누르면 서치 파라미터 변경되고 검색 결과를 띄워준다.
// 4. 구조가 복잡한데 도대체 서버 컴포넌트는 왜 쓰는거지...? ㅋㅋㅋㅋㅋㅋㅋㅋㅋ ㅇ<-<

export default function Search() {
  // TODO: api call here

  return (
    // FIXME: 검색 화면에 스크롤이 생기면 안될 것 같은데...
    <main className="mb-24 w-full h-full">
      <SearchHeader />

      <section className="p-5 space-y-7">
        <CategorySelector currentValue="전체" />
        <section>
          <CategoryTitle subTitle="위클리 HOT 5" />
          <SearchList data={MOCK_LIST_ITEM} />
        </section>
      </section>
    </main>
  );
}

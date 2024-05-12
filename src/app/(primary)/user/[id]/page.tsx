import React from 'react';
import ListManager from '@/components/ListManager';
import ListItem from '@/components/ListItem';
import { MOCK_LIST_ITEM } from 'mock/alcohol';
import UserInfo from './_components/UserInfo';
import HistoryOverview from './_components/HistoryOverview';
import SidebarHeader from './_components/SidebarHeader';

// NOTE: 해당 data 에 좋아요 여부, 리뷰 여부 포함되어야 함.

// TODO:
// 1. 유저 데이터 가져오는 api 연동
// 2. 활동 내역 가져오는 api 연동
// 3. 기타 버튼 액션과 관련된 api 연동
export default function User() {
  return (
    <main className="w-full h-full text-mainBlack mb-24">
      <section className="bg-bgGray p-7.5 pb-7">
        <SidebarHeader />
        <UserInfo
          profileImgSrc={null}
          follower={323}
          following={12}
          isFollowing
        />
        <HistoryOverview rates={52} reviews={12} likes={14} />
      </section>

      <section className="px-5 pt-9">
        {/* TODO: 합성 컴포넌트를 만든 후 적용 */}
        <ListManager displayValue="최근에 담은 순" />
        <section>
          {MOCK_LIST_ITEM.map((item) => (
            <ListItem key={item.whiskyId} data={item} />
          ))}
        </section>
      </section>
    </main>
  );
}

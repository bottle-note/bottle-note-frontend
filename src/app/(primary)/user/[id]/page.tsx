import React from 'react';
import ListManager from '@/components/ListManager';
import ListItem from '@/components/ListItem';
import UserInfo from './_components/UserInfo';
import HistoryOverview from './_components/HistoryOverview';
import SidebarHeader from './_components/SidebarHeader';

// NOTE: 해당 data 에 좋아요 여부, 리뷰 여부 포함되어야 함.

// TODO:
// 1. 유저 데이터 가져오는 api 연동
// 2. 활동 내역 가져오는 api 연동
// 3. 기타 버튼 액션과 관련된 api 연동
export default function User() {
  const MOCK_LIST_ITEM = [
    {
      whisky_id: 1,
      kor_name: '글렌피딕',
      eng_name: 'glen fi',
      rating: 3.5,
      category: 'single molt',
      image_path:
        'https://images.unsplash.com/photo-1580537922571-ca7180cd700e?q=80&w=986&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      whisky_id: 2,
      kor_name: '글렌피딕',
      eng_name: 'glen fi',
      rating: 3.5,
      category: 'single molt',
      image_path: 'https://i.imgur.com/ALxdcpJ.jpeg',
    },
    {
      whisky_id: 3,
      kor_name: '글렌피딕',
      eng_name: 'glen fi',
      rating: 3.5,
      category: 'single molt',
      image_path:
        'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      whisky_id: 4,
      kor_name: '글렌피딕',
      eng_name: 'glen fi',
      rating: 3.5,
      category: 'single molt',
      image_path:
        'https://images.unsplash.com/photo-1569977621579-58987bec59cd?q=80&w=997&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
  ];

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
            <ListItem key={item.whisky_id} data={item} />
          ))}
        </section>
      </section>
    </main>
  );
}

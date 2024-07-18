'use client';

import React from 'react';
import { MOCK_LIST_ITEM } from 'mock/alcohol';
import List from '@/components/List/List';
import UserInfo from './_components/UserInfo';
import HistoryOverview from './_components/HistoryOverview';
import SidebarHeader from './_components/SidebarHeader';
import NavLayout from '../../_components/NavLayout';
import LinkButton from '@/components/LinkButton';
import { usePopular } from '@/hooks/usePopular';

// TODO:
// 1. 유저 데이터 가져오는 api 연동
// 2. 활동 내역 가져오는 api 연동
// 3. 기타 버튼 액션과 관련된 api 연동
export default function User({ params: { id } }: { params: { id: string } }) {
  // FIXME: 활동 내역 가져오기 데이터로 변동
  const { populars } = usePopular();

  return (
    <NavLayout>
      <main className="text-mainBlack mb-24">
        <section className="bg-bgGray p-7.5 pb-7">
          <SidebarHeader />
          <UserInfo
            profileImgSrc={null}
            follower={323}
            following={12}
            isFollowing={false}
            currentId={id}
          />
          <HistoryOverview rates={52} reviews={12} likes={14} id={Number(id)} />
        </section>

        <section className="px-5 pt-9 flex flex-col gap-5">
          <List emptyViewText={`아직 활동한\n보틀이 없어요!`}>
            <List.Total total={33} />
            {populars.map((item) => (
              <List.Item data={item} />
            ))}
          </List>

          <LinkButton
            data={{
              engName: 'HISTORY',
              korName: '활동 히스토리',
              linkSrc: `/user/${id}/history?type=all`,
              icon: true,
            }}
          />
        </section>
      </main>
    </NavLayout>
  );
}

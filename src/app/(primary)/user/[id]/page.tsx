import React from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import ListManager from '@/components/ListManager';
import ListItem from '@/components/ListItem';
import UserInfo from './_components/UserInfo';
import HistoryOverview from './_components/HistoryOverview';
import Logo from 'public/Logo_2.svg';
import Menu from 'public/Menu_Sub_Coral.svg';

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
      image_path: 'https://i.imgur.com/ALxdcpJ.jpeg',
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
      image_path: 'https://i.imgur.com/ALxdcpJ.jpeg',
    },
    {
      whisky_id: 4,
      kor_name: '글렌피딕',
      eng_name: 'glen fi',
      rating: 3.5,
      category: 'single molt',
      image_path: 'https://i.imgur.com/ALxdcpJ.jpeg',
    },
  ];

  return (
    <main className="w-full h-full text-mainBlack mb-24">
      <section className="bg-bgGray p-7.5 pb-7">
        <article className="flex justify-between pb-6">
          <button>
            <Image src={Logo} alt="보틀노트" />
          </button>
          <button>
            <Image src={Menu} alt="메뉴 열기" />
          </button>
        </article>

        <UserInfo
          profileImgSrc={null}
          follower={323}
          following={12}
          isFollowing
        />
        <HistoryOverview rates={52} reviews={12} likes={14} />
      </section>

      <section className="px-5 pt-9">
        <ListManager />
        <section>
          {MOCK_LIST_ITEM.map((item) => (
            <ListItem key={item.whisky_id} data={item} />
          ))}
        </section>
      </section>
      <Navbar />
    </main>
  );
}

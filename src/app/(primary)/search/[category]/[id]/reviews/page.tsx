'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { SubHeader } from '@/app/(primary)/_components/SubHeader';
import ListManager from '@/components/List/ListManager';
import { Review as ReviewType } from '@/types/Review';
import Review from '@/app/(primary)/search/[category]/[id]/_components/Review';
import Link from 'next/link';
import EmptyView from '@/app/(primary)/_components/EmptyView';
import { truncStr } from '@/utils/truncStr';
import ReviewLayout from '../layout';

const SORT_OPTIONS = ['인기도순', '별점순', '병 가격 순', '잔 가격 순'];

function Reviews() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const alcoholId = params?.id;
  const alcoholKorName = searchParams.get('name');
  const [data, setData] = useState<ReviewType[] | null>(null);
  const [activeTab, setActiveTab] = useState('tab1');

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  // API naming 수정되면 적용하기
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/alcohols/${alcoholId}`,
          // `${process.env.NEXT_PUBLIC_SERVER_URL}/reviews/${alcoholId}`,
        );
        if (response.ok) {
          const result = await response.json();
          if (result.data.totalCount !== 0) {
            setData(result.data.reviews?.recentReviewInfos);
            // setData(result.data.reviewList);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);
  return (
    <div className="pb-5 relative">
      <SubHeader bgColor="bg-bgGray">
        <SubHeader.Left
          onClick={() => {
            router.back();
          }}
        >
          <Image
            src="/arrow-left-subcoral.svg"
            alt="arrowIcon"
            width={23}
            height={23}
          />
        </SubHeader.Left>
        <SubHeader.Center textColor="text-subCoral">
          {alcoholKorName && truncStr(alcoholKorName, 12)}
        </SubHeader.Center>
      </SubHeader>
      <section className="p-8 space-y-9">
        <div className="flex gap-3 relative">
          <button
            className={`py-2 ${activeTab === 'tab1' ? 'tab-selected' : 'tab-default'} w-full font-bold text-[0.938rem] text-center leading-[17.2px]`}
            onClick={() => handleTabClick('tab1')}
          >
            모든 리뷰
          </button>
          <button
            className={`py-2 ${activeTab === 'tab2' ? 'tab-selected' : 'tab-default'} w-full font-bold text-[0.938rem] text-center leading-[17.2px]`}
            onClick={() => handleTabClick('tab2')}
          >
            내가 작성한 리뷰
          </button>
        </div>
        <div>
          {activeTab === 'tab1' && (
            <>
              {/* 추후 컴포넌트 완성되면 적용 필요 */}
              <ListManager total={5} sortOptions={SORT_OPTIONS} />
              <section className="py-3 space-y-4">
                {data &&
                  data.length !== 0 &&
                  data.map((review, index) => (
                    <React.Fragment key={review.userId + index}>
                      <Review data={review} />
                      <div className="border-b border-mainGray/30" />
                    </React.Fragment>
                  ))}
              </section>
            </>
          )}
          {activeTab === 'tab2' && (
            <>
              {/* 추후 컴포넌트 완성되면 적용 필요 */}
              <ListManager total={5} sortOptions={SORT_OPTIONS} />
              <section className="py-3 space-y-4">
                {data && data.length !== 0 ? (
                  data.map((review, index) => (
                    <React.Fragment key={review.userId + index}>
                      <Review data={review} />
                      <div className="border-b border-mainGray/30" />
                    </React.Fragment>
                  ))
                ) : (
                  <EmptyView text="작성한 리뷰가 없어요!" />
                )}
              </section>
            </>
          )}
        </div>
      </section>
      <section className="px-5 fixed bottom-2 left-0 right-0">
        <div className="flex justify-center items-center w-full h-16 bg-subCoral rounded-xl">
          <Link
            className="text-white font-bold text-base"
            href={'/review/register'}
          >
            리뷰 작성
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Reviews;

Reviews.getLayout = (page: any) => <ReviewLayout>{page}</ReviewLayout>;

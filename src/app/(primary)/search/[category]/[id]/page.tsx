'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Star from '@/components/Star';
import { truncStr } from '@/utils/truncStr';
import { SubHeader } from '@/app/(primary)/_components/SubHeader';
import Label from '@/app/(primary)/_components/Label';
import FlavorTag from '../../../_components/FlavorTag';
import Review from '@/app/(primary)/search/[category]/[id]/_components/Review';
import { AlcoholDetails } from '@/types/Alcohol';
import LinkButton from '@/components/LinkButton';

type Details = {
  title: string;
  content: string;
};

function SearchCategory() {
  const router = useRouter();
  const params = useParams();
  const alcoholId = params?.id;
  const [data, setData] = useState<AlcoholDetails | null>(null);
  const [details, setDetails] = useState<Details[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/alcohols/${alcoholId}`, //parameter 수정하기
        );
        if (response.ok) {
          const result = await response.json();
          if (result.data.totalCount !== 0) {
            const alcoholData = result.data.alcohols;
            setData(result.data);
            setDetails([
              {
                title: '카테고리',
                content: alcoholData.engCategory,
              },
              {
                title: '국가/지역',
                content: alcoholData.engRegion,
              },
              {
                title: '캐스크',
                content: alcoholData.cask,
              },
              {
                title: '도수',
                content: alcoholData.avg,
              },
              {
                title: '증류소',
                content: alcoholData.engDistillery,
              },
            ]);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <div className="relative">
        {data?.alcohols?.alcoholUrlImg && (
          <div
            className={`absolute w-full h-full  bg-cover bg-center`}
            style={{ backgroundImage: `url(${data.alcohols.alcoholUrlImg})` }}
          />
        )}
        <div className="absolute w-full h-full bg-mainCoral bg-opacity-90" />
        <SubHeader bgColor="bg-mainCoral/10">
          <SubHeader.Left
            onClick={() => {
              router.back();
            }}
          >
            <Image
              src="/arrow-left-white.svg"
              alt="arrowIcon"
              width={23}
              height={23}
            />
          </SubHeader.Left>
          <SubHeader.Right onClick={() => {}}>
            {/* 브라우저는 복사, 핸드폰은 공유하기 */}
            <Image
              src="/externallink-outlined-white.svg"
              alt="linkIcon"
              width={23}
              height={23}
            />
          </SubHeader.Right>
        </SubHeader>
        <section className="relative z-10 flex px-5 pb-6 space-x-5">
          <div className="rounded-lg flex-2 bg-white p-4 h-56">
            <article className="relative h-48 w-28">
              {data?.alcohols?.alcoholUrlImg && (
                <Image
                  priority
                  className="max-w-full max-h-full"
                  src={data.alcohols.alcoholUrlImg}
                  alt="img"
                  width={150}
                  height={200}
                />
              )}
            </article>
          </div>
          <article className="flex-1 py-3 text-white space-y-2 overflow-x-hidden">
            {data?.alcohols && (
              <>
                <div className="space-y-1">
                  <Label name={data.alcohols.korCategory} />
                  <h1 className="text-xl font-semibold whitespace-normal break-words">
                    {data.alcohols.korName &&
                      truncStr(data.alcohols.korName, 27)}
                  </h1>
                  <p className="text-xs whitespace-normal break-words">
                    {data.alcohols.engName &&
                      truncStr(data.alcohols.engName.toUpperCase(), 45)}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-end space-x-1">
                    {data.alcohols.rating && (
                      <Star
                        rating={data.alcohols.rating}
                        size={27}
                        style={'text-white text-[27px] font-bold'}
                        color="white"
                      />
                    )}
                    <div className="text-xs mb-1">
                      (유저평가 {data.alcohols.totalRatingsCount})
                    </div>
                  </div>
                  <div className="border-[0.5px] border-white" />
                  <div className="flex space-x-3">
                    <div className="text-xs flex">
                      <Image
                        className="mr-1"
                        src="/edit-outlined-white.svg"
                        alt="write"
                        width={16}
                        height={16}
                      />
                      <button>리뷰 작성</button>
                    </div>
                    <div className="border-[0.5px] border-white my-[0.1rem]" />
                    <div className="text-xs flex">
                      <Image
                        className="mr-1"
                        src="/like-filled-subcoral-white.svg"
                        alt="like"
                        width={16}
                        height={16}
                      />
                      <button>찜하기</button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </article>
        </section>
      </div>
      <div className="mb-5">
        {/* 혜정님 별점 컴포넌트 완성되면 공통으로 사용하기 */}
        <section className="mx-5 py-5 border-y border-mainGray/30 grid grid-cols-2 gap-2">
          {details.map((data) => (
            <div
              key={data.content}
              className="flex text-xs text-mainDarkGray items-center"
            >
              <div className="min-w-14 font-semibold">{data.title}</div>
              <div className="flex-1 font-light">{data.content}</div>
            </div>
          ))}
        </section>
        {data?.alcohols?.tags && <FlavorTag tagList={data.alcohols.tags} />}
        <section className="mx-5 py-5 border-b border-mainGray/30 space-y-2">
          {data?.friendsInfo && (
            <>
              <div className="flex items-end space-x-1 text-xs text-mainDarkGray">
                <div>마셔본 친구</div>
                <div className="font-extralight">
                  {data.friendsInfo.followerCount}
                </div>
              </div>
              <div className="whitespace-nowrap overflow-x-auto flex space-x-5">
                {data.friendsInfo.friends?.map((user) => (
                  <div
                    key={user.userId}
                    className="flex-shrink-0 flex flex-col items-center space-y-1"
                  >
                    <Link href={`/user/${user.userId}`}>
                      <div className="w-14 h-14 rounded-full overflow-hidden">
                        <Image
                          className="object-cover"
                          src={user.user_image_url}
                          alt="user_img"
                          width={56}
                          height={56}
                        />
                      </div>
                    </Link>
                    <p className="text-xs text-mainDarkGray">
                      {truncStr(user.nickName, 4)}
                    </p>
                    <Star rating={user.rating} size={12} />
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
      {data?.reviews && data.reviews.totalReviewCount !== 0 && (
        <>
          <div className="h-4 bg-sectionWhite" />
          {/* 혜정님 합성 컴포넌트 적용되면 같이 적용하기 */}
          <section className="mx-5 py-5 space-y-4">
            <p className="text-xs text-mainGray">
              총 {data?.reviews?.totalReviewCount}개
            </p>
            {/* Login 완성되면 isMine 코드 추가하기 */}
            {data?.reviews?.bestReviewInfos &&
              data.reviews.bestReviewInfos.length > 0 && (
                <>
                  <div className="border-b border-mainGray/30" />
                  <Review
                    data={data.reviews.bestReviewInfos[0]}
                    isBest={true}
                    isMine={true}
                  />
                </>
              )}
            <div className="border-b border-mainGray/30" />
            {data?.reviews?.recentReviewInfos &&
              data.reviews.recentReviewInfos.length > 0 &&
              data.reviews.recentReviewInfos.map((review, index) => (
                <React.Fragment key={review.userId + index}>
                  <Review data={review} />
                  <div className="border-b border-mainGray/30" />
                </React.Fragment>
              ))}
          </section>
          <section className="mx-5 mb-5">
            {/* 쿼리 파람 확인해서 추가하기 */}
            <LinkButton
              data={{
                engName: 'MORE COMMENTS',
                korName: '리뷰 더 보기',
                icon: true,
                linkSrc: {
                  pathname: `/search/${data?.alcohols?.engCategory}/${data?.alcohols?.alcoholId}/reviews`,
                  query: {
                    name: data?.alcohols?.korName,
                  },
                },
              }}
            />
          </section>
        </>
      )}
    </div>
  );
}

export default SearchCategory;

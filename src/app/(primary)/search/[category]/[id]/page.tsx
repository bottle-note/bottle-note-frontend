'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Star from '@/components/Star';
import { truncStr } from '@/utils/truncStr';
import { SubHeader } from '@/app/(primary)/_components/SubHeader';
import Label from '@/app/(primary)/_components/Label';
import Review from '@/app/(primary)/search/[category]/[id]/_components/Review';
import { AlcoholDetails } from '@/types/Alcohol';
import LinkButton from '@/components/LinkButton';
import NavLayout from '@/app/(primary)/_components/NavLayout';
import StarRating from '@/components/StarRaiting';
import EmptyView from '@/app/(primary)/_components/EmptyView';
import PickBtn from '@/app/(primary)/_components/PickBtn';
import Modal from '@/components/Modal';
import { AlcoholsApi } from '@/app/api/AlcholsApi';
import { RateApi } from '@/app/api/RateApi';
import useModalStore from '@/store/modalStore';
import FlavorTag from '../../../_components/FlavorTag';
import { shareOrCopy } from '@/utils/shareOrCopy';

type Details = {
  title: string;
  content: string;
};

function SearchCategory() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const { category, id: alcoholId } = params;
  const { isShowModal, handleModal, handleLoginModal } = useModalStore();
  const [data, setData] = useState<AlcoholDetails | null>(null);
  const [details, setDetails] = useState<Details[]>([]);
  const [isPicked, setIsPicked] = useState<boolean>(false);
  const [rate, setRate] = useState(0);

  const fetchAlcoholDetails = async (id: string) => {
    const result = await AlcoholsApi.getAlcoholDetails(id);
    if (result) {
      const { alcohols } = result;
      setData(result);
      setIsPicked(alcohols.isPicked);
      setDetails([
        { title: '카테고리', content: alcohols.engCategory },
        { title: '국가/지역', content: alcohols.engRegion },
        { title: '캐스크', content: alcohols.cask },
        { title: '도수', content: alcohols.avg },
        { title: '증류소', content: alcohols.engDistillery },
      ]);
    }
  };

  useEffect(() => {
    if (alcoholId) {
      const alcoholIdString = alcoholId.toString();
      fetchAlcoholDetails(alcoholIdString);

      if (session) {
        (async () => {
          const ratingResult = await RateApi.getUserRating(alcoholIdString);
          setRate(ratingResult.rating);
        })();
      }
    }
  }, [alcoholId, session]);

  const handleRate = async (selectedRate: number) => {
    if (!session) return handleLoginModal();

    setRate(selectedRate);
    return RateApi.postRating({
      alcoholId: String(alcoholId),
      rating: selectedRate,
    });
  };

  return (
    <>
      <NavLayout>
        <div className="relative">
          {data?.alcohols?.alcoholUrlImg && (
            <div
              className="absolute w-full h-full  bg-cover bg-center"
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
                src="/icon/arrow-left-white.svg"
                alt="arrowIcon"
                width={23}
                height={23}
              />
            </SubHeader.Left>
            <SubHeader.Right
              onClick={() => {
                shareOrCopy(
                  `${process.env.NEXT_PUBLIC_BOTTLE_NOTE_URL}/category/${category}/${alcoholId}`,
                  handleModal,
                  `${data?.alcohols.korName} 정보`,
                  `${data?.alcohols.korName} 정보 상세보기`,
                );
              }}
            >
              <Image
                src="/icon/externallink-outlined-white.svg"
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
                    <Label
                      name={data.alcohols.korCategory}
                      styleClass="border-white px-2 py-[0.15rem] rounded-md text-10"
                    />
                    <h1 className="text-20 font-semibold whitespace-normal break-words">
                      {data.alcohols.korName &&
                        truncStr(data.alcohols.korName, 27)}
                    </h1>
                    <p className="text-13 whitespace-normal break-words">
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
                          style="text-white text-27 font-bold"
                          color="white"
                        />
                      )}
                      <div className="text-9 mb-1">
                        (유저평가 {data.alcohols.totalRatingsCount})
                      </div>
                    </div>
                    <div className="border-[0.5px] border-white" />
                    <div className="flex space-x-3">
                      <button
                        className="text-10 flex"
                        onClick={() => {
                          if (!session || !alcoholId) {
                            handleLoginModal();
                            return;
                          }
                          router.push(
                            `/review/register?alcoholId=${alcoholId}`,
                          );
                        }}
                      >
                        <Image
                          className="mr-1"
                          src="/icon/edit-outlined-white.svg"
                          alt="write"
                          width={16}
                          height={16}
                        />
                        리뷰 작성
                      </button>
                      <div className="border-[0.5px] border-white my-[0.1rem]" />
                      <PickBtn
                        isPicked={isPicked}
                        handleUpdatePicked={() => setIsPicked(!isPicked)}
                        handleError={() =>
                          setIsPicked(data?.alcohols?.isPicked)
                        }
                        handleNotLogin={handleLoginModal}
                        pickBtnName="찜하기"
                        alcoholId={Number(alcoholId)}
                        size={16}
                      />
                    </div>
                  </div>
                </>
              )}
            </article>
          </section>
        </div>
        <div className="mb-5">
          <article className="grid place-items-center space-y-2 py-5">
            <p className="text-10 text-mainDarkGray">
              이 술에 대한 평가를 남겨보세요.
            </p>
            <div>
              <StarRating rate={rate} size={40} handleRate={handleRate} />
            </div>
          </article>
          <section className="mx-5 py-5 border-y border-mainGray/30 grid grid-cols-2 gap-2">
            {details.map((item) => (
              <div
                key={item.content}
                className="flex text-13 text-mainDarkGray items-center"
              >
                <div className="min-w-14 font-semibold">{item.title}</div>
                <div className="flex-1 font-light">{item.content}</div>
              </div>
            ))}
          </section>
          {data?.alcohols?.tags && <FlavorTag tagList={data.alcohols.tags} />}
          <section className="mx-5 py-5 border-b border-mainGray/30 space-y-2">
            {data?.friendsInfo && (
              <>
                <div className="flex items-end space-x-1 text-13 text-mainDarkGray">
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
                      <p className="text-10 text-mainDarkGray">
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
        {data?.reviewList && data.reviewList.totalReviewCount !== 0 ? (
          <>
            <div className="h-4 bg-sectionWhite" />
            {/* 혜정님 합성 컴포넌트 적용되면 같이 적용하기 */}
            <section className="mx-5 py-5 space-y-3">
              <p className="text-13 text-mainGray font-normal">
                총 {data?.reviewList?.totalReviewCount}개
              </p>
              {/* Login 완성되면 isMine 코드 추가하기 */}
              {data?.reviewList?.bestReviewInfos &&
                data.reviewList.bestReviewInfos.length > 0 && (
                  <>
                    <div className="border-b border-mainGray/30" />
                    <Review
                      data={data.reviewList.bestReviewInfos[0]}
                      handleLogin={handleModal}
                    />
                  </>
                )}
              {data?.reviewList?.recentReviewInfos &&
                data.reviewList.recentReviewInfos.length > 0 &&
                data.reviewList.recentReviewInfos.map((review) => (
                  <React.Fragment key={review.userId + review.reviewId}>
                    <Review data={review} handleLogin={handleModal} />
                  </React.Fragment>
                ))}
            </section>
            <section className="mx-5 mb-24">
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
        ) : (
          <>
            <div className="h-4 bg-sectionWhite" />
            <section className="py-5">
              <EmptyView text="아직 리뷰가 없어요!" />
            </section>
          </>
        )}
      </NavLayout>
      {isShowModal && (
        <Modal
          mainText="해당 페이지 링크를 복사했습니다."
          subText="친구에게 공유하러 가볼까요?"
        />
      )}
    </>
  );
}

export default SearchCategory;

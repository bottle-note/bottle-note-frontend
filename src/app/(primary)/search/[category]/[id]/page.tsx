'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

import Star from '@/components/Star';
import { SubHeader } from '@/app/(primary)/_components/SubHeader';
import Review from '@/app/(primary)/search/[category]/[id]/_components/Review';
import LinkButton from '@/components/LinkButton';
import NavLayout from '@/app/(primary)/_components/NavLayout';
import StarRating from '@/components/StarRaiting';
import EmptyView from '@/app/(primary)/_components/EmptyView';
import Modal from '@/components/Modal';
import { truncStr } from '@/utils/truncStr';
// import { shareOrCopy } from '@/utils/shareOrCopy';
import { AuthService } from '@/lib/AuthService';
import { AlcoholsApi } from '@/app/api/AlcholsApi';
import { UserApi } from '@/app/api/UserApi';
import { RateApi } from '@/app/api/RateApi';
import useModalStore from '@/store/modalStore';
import { AlcoholDetails } from '@/types/Alcohol';
import { ROUTES } from '@/constants/routes';
import AlcoholDetailsSkeleton from '@/components/Skeletons/custom/AlcoholDetailsSkeleton';
import AlcoholBox from './_components/AlcoholBox';
import FlavorTag from '../../../_components/FlavorTag';

interface DetailItem {
  title: string;
  content: string;
}

export default function SearchAlcohol() {
  const router = useRouter();
  const params = useParams();
  const { isLogin } = AuthService;
  const { id: alcoholId } = params;
  const { state, handleModalState, handleLoginModal } = useModalStore();

  const [data, setData] = useState<AlcoholDetails | null>(null);
  const [alcoholDetails, setAlcoholDetails] = useState<DetailItem[]>([]);
  const [isPicked, setIsPicked] = useState<boolean>(false);
  const [rate, setRate] = useState(0);
  const [userNickName, setUserNickName] = useState<string>('');
  const [isUnmounting, setIsUnmounting] = useState(false);

  const fetchAlcoholDetails = async (id: string) => {
    try {
      const result = await AlcoholsApi.getAlcoholDetails(id);
      if (result) {
        const { alcohols } = result;
        setData(result);
        setIsPicked(alcohols.isPicked);
        setAlcoholDetails([
          { title: '증류소', content: alcohols.engDistillery },
          {
            title: '국가/지역',
            content: alcohols.engRegion?.replace('/', '/\n') || '-',
          },
          { title: '도수', content: `${alcohols.abv}%` },
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch alcohol details:', error);
    }
  };

  const getCurrentUserInfo = async () => {
    try {
      const result = await UserApi.getCurUserInfo();
      if (result) {
        setUserNickName(result.nickname);
      }
    } catch (error) {
      console.error('Failed to fetch current user info:', error);
    }
  };

  const fetchUserRating = async (alcohol: string) => {
    try {
      const ratingResult = await RateApi.getUserRating(alcohol);
      setRate(ratingResult.rating);
    } catch (error) {
      console.error('Failed to fetch user rating:', error);
    }
  };

  useEffect(() => {
    if (alcoholId) {
      const alcoholIdString = alcoholId.toString();
      fetchAlcoholDetails(alcoholIdString);

      if (isLogin) {
        fetchUserRating(alcoholIdString);
        getCurrentUserInfo();
      }
    }
  }, [alcoholId, isLogin]);

  useEffect(() => {
    return () => {
      setIsUnmounting(true);
    };
  }, []);

  const handleRate = async (selectedRate: number) => {
    if (!isLogin) return handleLoginModal();

    setRate(selectedRate);
    return RateApi.postRating({
      alcoholId: String(alcoholId),
      rating: selectedRate,
    });
  };

  const getRatingMessage = (myAvgRating: number, myRating: number) => {
    if (myAvgRating !== 0 && myRating !== 0)
      return (
        <div className="text-center text-12 space-y-2">
          <div>
            <p>{`${userNickName}`}님의</p>
            <p>
              <span className="text-subCoral font-medium">
                평균 별점은 {`${myAvgRating}`}점
              </span>
              이에요.
            </p>
          </div>
          <div className="text-10">
            <p>최근 평가한 별점은 {`${myRating}`}점이에요.</p>
            <p>다른 별점을 주시고 싶으시면 언제든지 변경해보세요!</p>
          </div>
        </div>
      );

    if (myAvgRating !== 0 && myRating === 0)
      return (
        <div className="text-center text-12">
          <p>최근 별점 {`${myAvgRating}`}을 주셨어요.</p>
          <p>별점이 없어요! 별점 평가를 안하실건가요?</p>
        </div>
      );

    return (
      <div className="text-center text-12">이 술에 대한 평가를 남겨보세요.</div>
    );
  };

  const refreshAlcoholDetails = useCallback(() => {
    fetchAlcoholDetails(alcoholId.toString());
  }, [alcoholId]);

  return (
    <>
      <NavLayout>
        {!data || !data.alcohols ? (
          <AlcoholDetailsSkeleton />
        ) : (
          <>
            <div className="relative">
              {/* 배경 레이어들 */}
              {data?.alcohols?.alcoholUrlImg && (
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${data.alcohols.alcoholUrlImg})`,
                  }}
                />
              )}
              <div
                className={`absolute inset-0 bg-mainCoral bg-opacity-90 ${
                  isUnmounting ? 'hidden' : ''
                }`}
              />

              {/* 콘텐츠 레이어 */}
              <div className="relative z-10">
                <SubHeader bgColor="bg-none">
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
                      handleModalState({
                        isShowModal: true,
                        type: 'ALERT',
                        mainText:
                          '아직 준비 중인 기능입니다. 조금만 기다려주세요!',
                      });
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

                <AlcoholBox
                  data={data?.alcohols}
                  isPicked={isPicked}
                  setIsPicked={setIsPicked}
                />
              </div>
            </div>
            <div className="mb-5">
              <article className="grid place-items-center space-y-2 pt-[25px] pb-[21px]">
                {getRatingMessage(
                  data?.alcohols?.myAvgRating,
                  data?.alcohols?.myRating,
                )}
                <div>
                  <StarRating rate={rate} size={42} handleRate={handleRate} />
                </div>
              </article>
              <section className="mx-5 py-[21px] border-y border-mainGray/30">
                <div className="grid gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    {alcoholDetails.map((item: DetailItem) => (
                      <div
                        key={item.content}
                        className="flex text-12 text-mainDarkGray items-start gap-2"
                      >
                        <div className="min-w-14 font-semibold">
                          {item.title}
                        </div>
                        <div className="flex-1 font-normal whitespace-pre-line">
                          {item.content}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex text-12 text-mainDarkGray items-start gap-2">
                    <div className="min-w-14 font-semibold">캐스크</div>
                    <div className="flex-1 font-normal break-words">
                      {data?.alcohols?.cask || '-'}
                    </div>
                  </div>
                </div>
              </section>
              {data?.alcohols?.alcoholsTastingTags && (
                <FlavorTag tagList={data.alcohols.alcoholsTastingTags} />
              )}
              {data?.friendsInfo && data.friendsInfo.followerCount !== 0 && (
                <section className="mx-5 py-5 border-b border-mainGray/30 space-y-2">
                  <div className="flex items-end space-x-1 text-13 text-mainDarkGray">
                    <div>마셔본 친구</div>
                    <div className="font-extralight">
                      {data.friendsInfo.followerCount}
                    </div>
                  </div>
                  <div className="whitespace-nowrap overflow-x-auto flex space-x-5 scrollbar-hide">
                    {data.friendsInfo.friends?.map((user) => (
                      <div
                        key={user.userId}
                        className="flex-shrink-0 flex flex-col items-center space-y-1"
                      >
                        <Link href={ROUTES.USER.BASE(user.userId)}>
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
                </section>
              )}
            </div>
            <>
              {data?.reviewInfo?.reviewList &&
              data.reviewInfo.totalCount !== 0 ? (
                <>
                  <div className="h-4 bg-sectionWhite" />
                  <section className="mx-5 pt-[34px] pb-[20px]">
                    <p className="text-11 text-mainGray font-normal mb-[10px]">
                      총 {data.reviewInfo.totalCount}개
                    </p>
                    <div className="border-b border-mainGray/30" />
                    {data.reviewInfo.reviewList.map((review) => (
                      <React.Fragment key={review.reviewId}>
                        <Review
                          data={review}
                          onRefresh={refreshAlcoholDetails}
                        />
                      </React.Fragment>
                    ))}
                  </section>
                  <section className="mx-5 mb-24">
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
                        handleBeforeRouteChange: (
                          e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
                        ) => {
                          if (!isLogin) {
                            e.preventDefault();
                            handleLoginModal();
                          }
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
            </>
          </>
        )}
      </NavLayout>
      {state.isShowModal && <Modal />}
    </>
  );
}

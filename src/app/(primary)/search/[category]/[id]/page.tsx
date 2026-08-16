'use client';

import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

import JsonLd from '@/components/seo/JsonLd';
import { generateAlcoholSchema } from '@/utils/seo/generateAlcoholSchema';
import Star from '@/components/ui/Display/Star';
import { SubHeader } from '@/components/ui/Navigation/SubHeader';
import ReviewListItem from '@/app/(primary)/search/[category]/[id]/_components/ReviewListItem';
import PrimaryLinkButton from '@/components/ui/Button/PrimaryLinkButton';
import NavLayout from '@/components/ui/Layout/NavLayout';
import StarRating from '@/components/ui/Form/StarRating';
import EmptyView from '@/components/ui/Display/EmptyView';
import List from '@/components/feature/List/List';
import { truncStr } from '@/utils/truncStr';
// import { shareOrCopy } from '@/utils/shareOrCopy';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import { AlcoholsApi } from '@/api/alcohol/alcohol.api';
import { AlcoholDetailsResponse } from '@/api/alcohol/types';
import { UserApi } from '@/api/user/user.api';
import { RateApi } from '@/api/rate/rate.api';
import useModalStore from '@/store/modalStore';
import { useLoginBridge } from '@/hooks/useLoginBridge';
import { trackGA4Event } from '@/utils/analytics/ga4';
import { ROUTES } from '@/constants/routes';
import AlcoholDetailsSkeleton from '@/components/ui/Loading/Skeletons/custom/AlcoholDetailsSkeleton';
import FlavorTags from '@/components/domain/alcohol/FlavorTags';
import { DEBOUNCE_DELAY } from '@/constants/common';
import useDebounceAction from '@/hooks/useDebounceAction';
import ShareDropdown from '@/components/share/ShareDropdown';
import SemanticIcon from '@/components/ui/Display/SemanticIcon';
import type { ShareConfig, ShareChannel } from '@/types/share';
import FloatingReviewButton from './_components/FloatingReviewButton';
import AlcoholDetailHeader from './_components/AlcoholDetailHeader';
import ProfileDefaultImg from 'public/profile-default.svg';

interface DetailItem {
  title: string;
  content: string;
}

export default function SearchAlcohol() {
  const router = useRouter();
  const params = useParams();
  const { isLoggedIn } = useAuthSession();
  const { id: alcoholId } = params;
  const { handleModalState } = useModalStore();
  const { bridgeToLogin } = useLoginBridge();
  const { debounce } = useDebounceAction(DEBOUNCE_DELAY);

  const [data, setData] = useState<AlcoholDetailsResponse | null>(null);
  const [alcoholDetails, setAlcoholDetails] = useState<DetailItem[]>([]);
  const [isPicked, setIsPicked] = useState<boolean>(false);
  const [rate, setRate] = useState(0);
  const [userNickName, setUserNickName] = useState<string>('');
  const [isShareOpen, setIsShareOpen] = useState(false);

  const viewTrackedAlcoholIdRef = useRef<string | null>(null);

  const fetchAlcoholDetails = async (id: string) => {
    try {
      const response = await AlcoholsApi.getAlcoholDetails(id);
      if (response) {
        const { alcohols } = response.data;
        setData(response.data);
        setIsPicked(alcohols.isPicked);

        if (viewTrackedAlcoholIdRef.current !== id) {
          viewTrackedAlcoholIdRef.current = id;
          trackGA4Event('view_alcohol_detail', {
            alcohol_id: id,
            alcohol_name: alcohols.korName,
          });
        }

        const formatContent = (content: string | undefined) =>
          content?.replace('/', '/\n') || '-';

        setAlcoholDetails([
          { title: '카테고리', content: alcohols.engCategory },
          { title: '증류소', content: formatContent(alcohols.engDistillery) },
          { title: '캐스크', content: formatContent(alcohols.cask) },
          { title: '국가/지역', content: formatContent(alcohols.engRegion) },
          {
            title: '도수(%)',
            content: formatContent(alcohols.abv),
          },
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch alcohol details:', error);
    }
  };

  const getCurrentUserInfo = async () => {
    try {
      const response = await UserApi.getCurUserInfo();
      if (response) {
        setUserNickName(response.data.nickname);
      }
    } catch (error) {
      console.error('Failed to fetch current user info:', error);
    }
  };

  const fetchUserRating = async (alcohol: string) => {
    try {
      const ratingResult = await RateApi.getUserRating(alcohol);
      setRate(ratingResult.data.rating);
    } catch (error) {
      console.error('Failed to fetch user rating:', error);
    }
  };

  useEffect(() => {
    if (alcoholId) {
      const alcoholIdString = alcoholId.toString();
      fetchAlcoholDetails(alcoholIdString);

      if (isLoggedIn) {
        fetchUserRating(alcoholIdString);
        getCurrentUserInfo();
      }
    }
  }, [alcoholId, isLoggedIn]);

  const handleRate = useCallback(
    async (selectedRate: number) => {
      if (!isLoggedIn) return bridgeToLogin('rating');

      setRate(selectedRate);

      debounce(async () => {
        try {
          await RateApi.postRating({
            alcoholId: String(alcoholId),
            rating: selectedRate,
          });
          trackGA4Event('rate_alcohol', {
            alcohol_id: String(alcoholId),
            alcohol_name: data?.alcohols.korName ?? '',
          });
        } catch (error) {
          fetchUserRating(alcoholId.toString());
          console.error(error);
        }
      });
    },
    [isLoggedIn, alcoholId, debounce, data],
  );

  const getRatingMessage = (myAvgRating: number, myRating: number) => {
    if (myAvgRating !== 0 && myRating !== 0)
      return (
        <div className="space-y-2 text-center text-12 text-fg-neutral">
          <div>
            <p>{`${userNickName}`}님의</p>
            <p>
              <span className="font-medium text-fg-rating">
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
        <div className="text-center text-12 text-fg-neutral">
          <p>최근 별점 {`${myAvgRating}`}을 주셨어요.</p>
          <p>별점이 없어요! 별점 평가를 안하실건가요?</p>
        </div>
      );

    return (
      <div className="text-center text-12 text-fg-neutral">
        이 술에 대한 평가를 남겨보세요.
      </div>
    );
  };

  const refreshAlcoholDetails = useCallback(() => {
    fetchAlcoholDetails(alcoholId.toString());
  }, [alcoholId]);

  const alcoholSchema = useMemo(() => {
    return data?.alcohols
      ? generateAlcoholSchema(data.alcohols, data.reviewInfo?.reviewList)
      : null;
  }, [data?.alcohols, data?.reviewInfo?.reviewList]);

  const shareConfig: ShareConfig | null = useMemo(() => {
    if (!data?.alcohols) return null;

    const alcohol = data.alcohols;
    const linkUrl =
      typeof window !== 'undefined'
        ? window.location.href
        : `https://bottle-note.com/search/${alcohol.engCategory}/${alcohol.alcoholId}`;

    return {
      type: 'whisky',
      contentId: String(alcohol.alcoholId),
      title: alcohol.korName || alcohol.engName,
      description: `${alcohol.korCategory} | ${alcohol.engName}`,
      imageUrl: alcohol.alcoholUrlImg || '/images/og-image.png',
      linkUrl,
      buttonTitle: '위스키 보기',
    };
  }, [data?.alcohols]);

  const handleShare = (_channel: ShareChannel, _success: boolean) => {
    // TODO: Analytics tracking
  };

  const reviewList = data?.reviewInfo?.reviewList ?? [];
  const reviewTotalCount = data?.reviewInfo?.totalCount;

  return (
    <>
      {alcoholSchema && <JsonLd data={alcoholSchema} />}
      <NavLayout>
        {!data || !data.alcohols ? (
          <AlcoholDetailsSkeleton />
        ) : (
          <>
            <div className="relative">
              <div className="absolute inset-0 bg-bg-brand-primary-solid" />

              {/* 콘텐츠 레이어 */}
              <div className="relative z-10">
                <SubHeader bgColor="bg-bg-transparent">
                  <SubHeader.Left
                    onClick={() => {
                      router.back();
                    }}
                  >
                    <SemanticIcon
                      src="/icon/arrow-left-white.svg"
                      width={23}
                      height={23}
                      className="text-fg-brand-contrast"
                      label="뒤로가기"
                    />
                  </SubHeader.Left>
                  <SubHeader.Right onClick={() => setIsShareOpen(true)}>
                    <SemanticIcon
                      src="/icon/externallink-outlined-white.svg"
                      width={23}
                      height={23}
                      className="text-fg-brand-contrast"
                      label="공유하기"
                    />
                  </SubHeader.Right>
                </SubHeader>

                <AlcoholDetailHeader
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
              <section className="mx-5 border-y border-stroke-neutral-subtle py-[21px]">
                <div className="grid gap-2">
                  {alcoholDetails.map((item: DetailItem) => (
                    <div
                      key={item.content}
                      className="flex items-start gap-2 text-12"
                    >
                      <div className="min-w-14 font-semibold text-fg-neutral-muted">
                        {item.title}
                      </div>
                      <div className="flex-1 break-words font-normal text-fg-neutral">
                        {item.content}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              {data?.alcohols?.alcoholsTastingTags && (
                <FlavorTags tagList={data.alcohols.alcoholsTastingTags} />
              )}
              {data?.friendsInfo && data.friendsInfo.followerCount !== 0 && (
                <section className="mx-5 space-y-2 border-b border-stroke-neutral-subtle py-5">
                  <div className="flex items-end space-x-1 text-13 text-fg-neutral">
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
                          <div className="h-14 w-14 overflow-hidden rounded-full border border-stroke-neutral-basement">
                            <Image
                              className="object-cover"
                              src={user.userImageUrl ?? ProfileDefaultImg}
                              alt="user_img"
                              width={59}
                              height={59}
                            />
                          </div>
                        </Link>
                        <p className="text-11 text-fg-neutral-muted">
                          {truncStr(user.nickName, 4)}
                        </p>
                        <Star rating={user.rating} size={14} />
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
            <>
              {reviewList.length > 0 ? (
                <>
                  <div className="h-4 bg-bg-layer-basement" />
                  <section className="mx-5 pt-[34px] pb-[20px]">
                    {typeof reviewTotalCount === 'number' && (
                      <div className="mb-[10px]">
                        <List.Total total={reviewTotalCount} />
                      </div>
                    )}
                    <div className="border-b border-stroke-neutral-subtle" />
                    {reviewList.map((review) => (
                      <React.Fragment key={review.reviewId}>
                        <ReviewListItem
                          data={review}
                          onRefresh={refreshAlcoholDetails}
                        />
                      </React.Fragment>
                    ))}
                  </section>
                  <section className="mx-5 mb-24">
                    <PrimaryLinkButton
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
                          if (!isLoggedIn) {
                            e.preventDefault();
                            bridgeToLogin('comment');
                          }
                        },
                      }}
                    />
                  </section>
                </>
              ) : (
                <>
                  <div className="h-4 bg-bg-layer-basement" />
                  <section className="py-5">
                    <EmptyView text="아직 리뷰가 없어요!" />
                  </section>
                </>
              )}
            </>
          </>
        )}
        {shareConfig && (
          <ShareDropdown
            isOpen={isShareOpen}
            onClose={() => setIsShareOpen(false)}
            config={shareConfig}
            onShare={handleShare}
          />
        )}
        {data?.alcohols?.alcoholId && (
          <FloatingReviewButton alcoholId={String(data.alcohols.alcoholId)} />
        )}
      </NavLayout>
    </>
  );
}

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
import { ChevronDown } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import Star from '@/components/ui/Display/Star';
import { SubHeader } from '@/components/ui/Navigation/SubHeader';
import ReviewListItem from '@/app/(primary)/alcohols/[id]/_components/ReviewListItem';
import PrimaryLinkButton from '@/components/ui/Button/PrimaryLinkButton';
import NavLayout from '@/components/ui/Layout/NavLayout';
import EmptyView from '@/components/ui/Display/EmptyView';
import List from '@/components/feature/List/List';
import { truncStr } from '@/utils/truncStr';
// import { shareOrCopy } from '@/utils/shareOrCopy';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import type { AlcoholDetailsResponse } from '@/api/alcohol/types';
import { UserApi } from '@/api/user/user.api';
import { RateApi } from '@/api/rate/rate.api';
import { ERROR_MESSAGES } from '@/api/_shared/errorMessages';
import useModalStore from '@/store/modalStore';
import { useLoginBridge } from '@/hooks/useLoginBridge';
import { trackGA4Event } from '@/utils/analytics/ga4';
import { ROUTES } from '@/constants/routes';
import {
  alcoholDetailKeys,
  useAlcoholDetailQuery,
} from '@/queries/useAlcoholDetailQuery';
import AlcoholDetailsSkeleton from '@/components/ui/Loading/Skeletons/custom/AlcoholDetailsSkeleton';
import FlavorTags from '@/components/domain/alcohol/FlavorTags';
import AlcoholRatingInput from '@/components/domain/alcohol/AlcoholRatingInput';
import ShareDropdown from '@/components/share/ShareDropdown';
import SemanticIcon from '@/components/ui/Display/SemanticIcon';
import AnimatedCollapse from '@/components/ui/Display/AnimatedCollapse';
import type { ShareConfig, ShareChannel } from '@/types/share';
import FloatingReviewButton from './FloatingReviewButton';
import AlcoholDetailHeader from './AlcoholDetailHeader';
import { GuestAlcoholDetailGate } from './GuestAlcoholDetailGate';
import AlcoholImportClearance from './AlcoholImportClearance';
import { useAlcoholImportClearanceItems } from './useAlcoholImportClearanceItems';
import RatingSuccessModal from './RatingSuccessModal';
import ProfileDefaultImg from 'public/profile-default.svg';

interface DetailItem {
  title: string;
  content: string;
}

interface AlcoholDetailPageProps {
  initialData?: AlcoholDetailsResponse;
}

export default function AlcoholDetailPage({
  initialData,
}: AlcoholDetailPageProps) {
  const router = useRouter();
  const params = useParams();
  const { isLoggedIn, isLoading: isAuthLoading, user } = useAuthSession();
  const { id: alcoholId } = params;
  const alcoholIdString = Array.isArray(alcoholId)
    ? alcoholId[0]
    : alcoholId ?? '';
  const viewerId = user?.userId ?? null;
  const queryClient = useQueryClient();
  const { handleModalState } = useModalStore();
  const { bridgeToLogin } = useLoginBridge();
  const { data, isFetchedAfterMount, isSuccess, refetch } =
    useAlcoholDetailQuery({
      alcoholId: alcoholIdString,
      viewerId,
      initialData,
      enabled: !isAuthLoading,
    });
  const isPicked = data?.alcohols.isPicked ?? false;
  const setIsPicked = useCallback(
    (value: React.SetStateAction<boolean>) => {
      queryClient.setQueryData<AlcoholDetailsResponse>(
        alcoholDetailKeys.detail(alcoholIdString, viewerId),
        (current) => {
          if (!current) return current;
          const nextIsPicked =
            typeof value === 'function'
              ? value(current.alcohols.isPicked)
              : value;
          return {
            ...current,
            alcohols: { ...current.alcohols, isPicked: nextIsPicked },
          };
        },
      );
    },
    [alcoholIdString, queryClient, viewerId],
  );
  const [rate, setRate] = useState(0);
  const [userNickName, setUserNickName] = useState<string>('');
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isRatingSuccessOpen, setIsRatingSuccessOpen] = useState(false);
  const [successfulRating, setSuccessfulRating] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isDescriptionClamped, setIsDescriptionClamped] = useState(true);
  const [collapsedDescriptionHeight, setCollapsedDescriptionHeight] =
    useState(66);

  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const viewTrackedAlcoholIdRef = useRef<string | null>(null);
  const currentRateRef = useRef(0);
  const viewerRequestIdRef = useRef(0);
  const latestRatingRequestIdRef = useRef(0);
  const ratingRequestQueueRef = useRef<Promise<void>>(Promise.resolve());

  const alcoholDetails = useMemo<DetailItem[]>(() => {
    const alcohol = data?.alcohols;
    if (!alcohol) return [];

    const formatContent = (content: string | undefined) =>
      content?.replace('/', '/\n') || '-';

    return [
      { title: '카테고리', content: alcohol.engCategory },
      { title: '증류소', content: formatContent(alcohol.engDistillery) },
      { title: '캐스크', content: formatContent(alcohol.cask) },
      { title: '국가/지역', content: formatContent(alcohol.engRegion) },
      { title: '도수(%)', content: formatContent(alcohol.abv) },
    ];
  }, [data?.alcohols]);

  const setCurrentRate = useCallback((nextRate: number) => {
    currentRateRef.current = nextRate;
    setRate(nextRate);
  }, []);

  const handleRatingSuccessClose = useCallback(() => {
    setIsRatingSuccessOpen(false);
  }, []);

  useEffect(() => {
    if (!isFetchedAfterMount || !isSuccess || !data?.alcohols || isAuthLoading)
      return;
    if (viewTrackedAlcoholIdRef.current === alcoholIdString) return;

    viewTrackedAlcoholIdRef.current = alcoholIdString;
    trackGA4Event('view_alcohol_detail', {
      alcohol_id: alcoholIdString,
      alcohol_name: data.alcohols.korName,
    });
  }, [alcoholIdString, data, isAuthLoading, isFetchedAfterMount, isSuccess]);

  const getCurrentUserInfo = async (requestId: number) => {
    try {
      const response = await UserApi.getCurUserInfo();
      if (response && requestId === viewerRequestIdRef.current) {
        setUserNickName(response.data.nickname);
      }
    } catch (error) {
      console.error('Failed to fetch current user info:', error);
    }
  };

  const fetchUserRating = async (
    alcohol: string,
    requestId = viewerRequestIdRef.current,
  ): Promise<boolean> => {
    try {
      const ratingResult = await RateApi.getUserRating(alcohol);
      if (requestId !== viewerRequestIdRef.current) return false;
      setCurrentRate(ratingResult.data.rating);
      return true;
    } catch (error) {
      console.error('Failed to fetch user rating:', error);
      return false;
    }
  };

  useEffect(() => {
    const requestId = ++viewerRequestIdRef.current;
    setCurrentRate(0);
    setUserNickName('');
    if (isAuthLoading || !isLoggedIn || !alcoholIdString) return;
    void fetchUserRating(alcoholIdString, requestId);
    void getCurrentUserInfo(requestId);
  }, [alcoholIdString, isAuthLoading, isLoggedIn, viewerId]);

  const handleRateChange = useCallback(
    (selectedRate: number) => {
      if (!isLoggedIn) return;
      setCurrentRate(selectedRate);
    },
    [isLoggedIn, setCurrentRate],
  );

  const handleRateCommit = useCallback(
    (selectedRate: number) => {
      if (!isLoggedIn) return bridgeToLogin('rating');
      const requestId = ++latestRatingRequestIdRef.current;

      ratingRequestQueueRef.current = ratingRequestQueueRef.current
        .catch(() => undefined)
        .then(async () => {
          try {
            await RateApi.postRating({
              alcoholId: Number(alcoholId),
              rating: selectedRate,
            });

            if (requestId !== latestRatingRequestIdRef.current) return;

            trackGA4Event('rate_alcohol', {
              alcohol_id: String(alcoholId),
              alcohol_name: data?.alcohols.korName ?? '',
            });
            setSuccessfulRating(selectedRate);
            setIsRatingSuccessOpen(true);
            void refetch();
          } catch (error) {
            if (requestId !== latestRatingRequestIdRef.current) return;

            const isRecovered = await fetchUserRating(String(alcoholId));
            handleModalState({
              isShowModal: true,
              mainText: ERROR_MESSAGES.RATE_CREATE_FAILED,
              subText: isRecovered
                ? '저장된 별점으로 복구했습니다. 다시 시도해주세요.'
                : '저장 상태를 확인하지 못했습니다. 다시 시도해주세요.',
            });
            console.error(error);
          }
        });
    },
    [
      alcoholId,
      bridgeToLogin,
      data?.alcohols.korName,
      handleModalState,
      isLoggedIn,
      refetch,
    ],
  );

  const getRatingMessage = (myAvgRating: number, myRating: number) => {
    if (myAvgRating !== 0 && myRating !== 0)
      return (
        <div className="space-y-8 text-center text-12 text-fg-neutral">
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
    void refetch();
  }, [refetch]);

  const shareConfig: ShareConfig | null = useMemo(() => {
    if (!data?.alcohols) return null;

    const alcohol = data.alcohols;
    const linkUrl =
      typeof window !== 'undefined'
        ? window.location.href
        : `https://bottle-note.com${ROUTES.ALCOHOL.DETAIL(alcohol.alcoholId)}`;

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
  const isGuest = !isLoggedIn;
  const isPersonalizedReady =
    !isAuthLoading && (!isLoggedIn || (isFetchedAfterMount && isSuccess));

  const handleGuestLogin = (returnTo: string) => {
    router.replace(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  };

  const detailReturnTo =
    typeof window === 'undefined'
      ? ''
      : `${window.location.pathname}${window.location.search}`;

  const hasFlavorTags = Boolean(data?.alcohols?.alcoholsTastingTags?.length);
  const description = data?.alcohols?.description?.trim();
  useEffect(() => {
    if (descriptionRef.current && !isDescriptionExpanded) {
      setCollapsedDescriptionHeight(
        Math.min(66, descriptionRef.current.offsetHeight),
      );
    }
  }, [description, isDescriptionExpanded]);
  const { items: importClearanceItems } = useAlcoholImportClearanceItems(
    data?.alcohols?.alcoholId ?? null,
  );
  const hasImportInfo = Boolean(importClearanceItems?.length);

  const alcoholMetadataAndTags = (
    <>
      {description && (
        <section className="mx-20 flex flex-col gap-8 border-y border-stroke-neutral-subtle py-12">
          <h2 className="text-16 font-bold text-fg-neutral">위스키 소개</h2>
          <AnimatedCollapse
            isOpen={isDescriptionExpanded}
            collapsedHeight={collapsedDescriptionHeight}
            onCollapseComplete={() => setIsDescriptionClamped(true)}
          >
            <p
              ref={descriptionRef}
              className={`whitespace-pre-line text-13 font-normal leading-22 text-fg-neutral-muted ${
                isDescriptionClamped ? 'line-clamp-3' : ''
              }`}
            >
              {description}
            </p>
          </AnimatedCollapse>
          <button
            type="button"
            aria-expanded={isDescriptionExpanded}
            onClick={() => {
              if (!isDescriptionExpanded) setIsDescriptionClamped(false);
              setIsDescriptionExpanded((prev) => !prev);
            }}
            className="inline-flex items-center gap-4 self-end text-12 font-medium text-fg-neutral-subtle"
          >
            {isDescriptionExpanded ? '접기' : '더보기'}
            <ChevronDown
              aria-hidden
              className={`h-14 w-14 transition-transform ${
                isDescriptionExpanded ? 'rotate-180' : ''
              }`}
            />
          </button>
        </section>
      )}
      <section
        className={`mx-20 py-16 ${
          description ? '' : 'border-t border-stroke-neutral-subtle'
        } ${hasFlavorTags || hasImportInfo ? 'border-b' : ''}`}
      >
        <div className="grid gap-6">
          {alcoholDetails.map((item: DetailItem) => (
            <div key={item.content} className="flex items-start gap-8 text-12">
              <div className="min-w-56 font-semibold text-fg-neutral-muted">
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
        <FlavorTags
          tagList={data.alcohols.alcoholsTastingTags}
          showBottomBorder={hasImportInfo}
        />
      )}
      {data?.alcohols?.alcoholId && (
        <AlcoholImportClearance
          alcoholId={data.alcohols.alcoholId}
          korName={data.alcohols.korName}
        />
      )}
    </>
  );

  const friendsRating =
    data?.friendsInfo && data.friendsInfo.followerCount !== 0 ? (
      <section className="mx-20 space-y-8 border-b border-stroke-neutral-subtle py-20">
        <div className="flex items-end space-x-4 text-13 text-fg-neutral">
          <div>마셔본 친구</div>
          <div className="font-extralight">
            {data.friendsInfo.followerCount}
          </div>
        </div>
        <div className="whitespace-nowrap overflow-x-auto flex space-x-20 scrollbar-hide">
          {data.friendsInfo.friends?.map((user) => (
            <div
              key={user.userId}
              className="flex-shrink-0 flex flex-col items-center space-y-4"
            >
              <Link href={ROUTES.USER.BASE(user.userId)}>
                <div className="h-56 w-56 overflow-hidden rounded-full border border-stroke-neutral-basement">
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
    ) : null;

  return (
    <>
      <NavLayout>
        {!data || !data.alcohols ? (
          <AlcoholDetailsSkeleton />
        ) : (
          <div
            className={
              isGuest
                ? 'grid h-dvh grid-rows-[minmax(0,auto)_minmax(min-content,1fr)] pb-navbar'
                : undefined
            }
          >
            <div
              className={`relative border-b border-stroke-neutral-subtle bg-bg-neutral-weak ${isGuest ? 'overflow-y-auto' : ''}`}
            >
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
                      className="text-fg-neutral"
                      label="뒤로가기"
                    />
                  </SubHeader.Left>
                  <SubHeader.Right onClick={() => setIsShareOpen(true)}>
                    <SemanticIcon
                      src="/icon/externallink-outlined-white.svg"
                      width={23}
                      height={23}
                      className="text-fg-neutral"
                      label="공유하기"
                    />
                  </SubHeader.Right>
                </SubHeader>

                <AlcoholDetailHeader
                  data={data?.alcohols}
                  isPicked={isPicked}
                  setIsPicked={setIsPicked}
                  isPersonalizedReady={isPersonalizedReady}
                  isAuthLoading={isAuthLoading}
                />
              </div>
            </div>
            <div
              className={
                isGuest
                  ? 'grid min-h-0 grid-rows-[auto_minmax(min-content,1fr)]'
                  : 'mb-20'
              }
            >
              {isPersonalizedReady ? (
                <article className="grid place-items-center space-y-8 py-16">
                  {getRatingMessage(
                    data?.alcohols?.myAvgRating,
                    data?.alcohols?.myRating,
                  )}
                  <div>
                    <AlcoholRatingInput
                      value={rate}
                      onChange={handleRateChange}
                      onCommit={handleRateCommit}
                      tone="brand"
                    />
                  </div>
                </article>
              ) : (
                <div aria-hidden="true" className="h-96 animate-pulse" />
              )}
              {isGuest ? (
                <GuestAlcoholDetailGate
                  isAuthLoading={isAuthLoading}
                  title="지금 보고 계신 위스키, 관심있으신가요?"
                  description="보틀노트에 기록하고 나만의 취향 노트를 쌓아보세요!"
                  buttonLabel="로그인하고 기록 시작하기"
                  onLogin={() => handleGuestLogin(detailReturnTo)}
                >
                  {alcoholMetadataAndTags}
                  {friendsRating}
                </GuestAlcoholDetailGate>
              ) : (
                <>
                  {alcoholMetadataAndTags}
                  {friendsRating}
                </>
              )}
            </div>
            {!isGuest && (
              <>
                <div className="h-16 bg-bg-layer-basement" />
                {reviewList.length > 0 ? (
                  <>
                    <section id="reviews" className="mx-20 pt-34 pb-20">
                      {typeof reviewTotalCount === 'number' && (
                        <div className="mb-10">
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
                    <section className="mx-20 mb-96">
                      <PrimaryLinkButton
                        data={{
                          engName: 'MORE COMMENTS',
                          korName: '리뷰 더 보기',
                          icon: true,
                          linkSrc: {
                            pathname: ROUTES.ALCOHOL.REVIEWS(String(alcoholId)),
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
                  <section className="py-20">
                    <EmptyView text="아직 리뷰가 없어요!" />
                  </section>
                )}
              </>
            )}
          </div>
        )}
        {shareConfig && (
          <ShareDropdown
            isOpen={isShareOpen}
            onClose={() => setIsShareOpen(false)}
            config={shareConfig}
            onShare={handleShare}
          />
        )}
        {isLoggedIn && data?.alcohols?.alcoholId && (
          <FloatingReviewButton alcoholId={String(data.alcohols.alcoholId)} />
        )}
        <RatingSuccessModal
          isOpen={isRatingSuccessOpen}
          rating={successfulRating}
          onClose={handleRatingSuccessClose}
        />
      </NavLayout>
    </>
  );
}

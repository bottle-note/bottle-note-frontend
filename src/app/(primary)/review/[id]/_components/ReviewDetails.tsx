import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Label from '@/app/(primary)/_components/Label';
import { truncStr } from '@/utils/truncStr';
import Star from '@/components/Star';
import VisibilityToggle from '@/app/(primary)/_components/VisibilityToggle';
import FlavorTag from '@/app/(primary)/_components/FlavorTag';
import { numberWithCommas } from '@/utils/formatNum';
import { formatDate } from '@/utils/formatDate';
// import { shareOrCopy } from '@/utils/shareOrCopy';
import LikeBtn from '@/app/(primary)/_components/LikeBtn';
import OptionDropdown from '@/components/OptionDropdown';
import useModalStore from '@/store/modalStore';
import { ReviewDetailsWithoutAlcoholInfo } from '@/types/Review';
import { deleteReview } from '@/lib/Review';
import { AuthService } from '@/lib/AuthService';
import { ROUTES } from '@/constants/routes';
import ProfileDefaultImg from 'public/profile-default.svg';

interface Props {
  data: ReviewDetailsWithoutAlcoholInfo;
  handleLogin: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onRefresh: () => void;
}

function ReviewDetails({ data, handleLogin, textareaRef, onRefresh }: Props) {
  const router = useRouter();
  const { userData, isLogin } = AuthService;
  const { handleModalState, handleLoginModal } = useModalStore();
  const [isOptionShow, setIsOptionShow] = useState(false);
  const [isLiked, setIsLiked] = useState(data?.reviewInfo?.isLikedByMe);
  const [likeCount, setLikeCount] = useState(data?.reviewInfo?.likeCount);

  const handleCloseOption = () => {
    handleModalState({
      isShowModal: true,
      type: 'ALERT',
      mainText: '성공적으로 삭제되었습니다.',
      handleConfirm: () => {
        setIsOptionShow(false);
        handleModalState({
          isShowModal: false,
          mainText: '',
        });
        router.back();
      },
    });
  };

  const handleOptionSelect = (option: { name: string; type: string }) => {
    if (option.type === 'DELETE') {
      handleModalState({
        isShowModal: true,
        mainText: '정말 삭제하시겠습니까?',
        type: 'CONFIRM',
        handleConfirm: () => {
          deleteReview(data.reviewInfo?.reviewId, handleCloseOption);
        },
      });
    } else if (option.type === 'MODIFY') {
      router.push(ROUTES.REVIEW.MODIFY(data.reviewInfo?.reviewId));
    } else if (option.type === 'REVIEW_REPORT') {
      router.push(ROUTES.REPORT.REVIEW(data.reviewInfo?.reviewId));
    } else if (option.type === 'USER_REPORT') {
      router.push(ROUTES.REPORT.USER(data.reviewInfo?.userInfo?.userId));
    }
  };

  const hasValidPrice = data.reviewInfo?.price || data.reviewInfo?.price === 0;
  const hasValidSizeType = data.reviewInfo?.sizeType;
  const hasValidLocation = data.reviewInfo?.locationInfo?.address;
  const shouldShowPriceOrLocation =
    hasValidLocation || (hasValidPrice && hasValidSizeType);

  return (
    <>
      <section className="pt-[38px]">
        <section className="mx-5 pb-5 border-b border-mainGray/30 ">
          <article className="flex items-center justify-between">
            <Link href={ROUTES.USER.BASE(userData?.userId!)}>
              <div className="flex items-center space-x-[7px] ">
                <div className="w-[1.9rem] h-[1.9rem] rounded-full overflow-hidden">
                  <Image
                    className="object-cover"
                    src={
                      data.reviewInfo?.userInfo?.userProfileImage ??
                      ProfileDefaultImg
                    }
                    alt="user_img"
                    width={30}
                    height={30}
                  />
                </div>
                <p className="text-mainGray text-13">
                  {data.reviewInfo?.userInfo?.nickName &&
                    truncStr(data.reviewInfo.userInfo.nickName, 12)}
                </p>
              </div>
            </Link>
            <Star
              rating={data.reviewInfo?.rating ?? 0}
              size={21}
              textStyle="text-20 text-subCoral font-semibold w-7"
            />
          </article>
          <article className="flex items-center mt-[10px] space-x-2">
            {data.reviewInfo?.isBestReview && (
              <Label
                name="베스트"
                icon="/icon/thumbup-filled-white.svg"
                styleClass="bg-mainCoral text-white px-2 py-[0.1rem] border-mainCoral text-10 rounded"
              />
            )}
            {data.reviewInfo?.isMyReview && (
              <Label
                name="나의 코멘트"
                icon="/icon/user-outlined-subcoral.svg"
                styleClass="border-mainCoral text-mainCoral px-2 py-[0.1rem] text-10 rounded"
              />
            )}
            {data.reviewInfo?.userInfo?.userId === userData?.userId && (
              <VisibilityToggle
                initialStatus={data.reviewInfo.status === 'PUBLIC'}
                reviewId={data?.reviewInfo?.reviewId}
                handleNotLogin={handleLoginModal}
                onSuccess={onRefresh}
              />
            )}
          </article>
          {data.reviewImageList && (
            <div className="my-[22px] whitespace-nowrap overflow-x-auto flex space-x-2 scrollbar-hide">
              {data.reviewImageList.map((imgData) => (
                <div
                  className="relative w-[147px] h-[147px] flex-shrink-0"
                  key={imgData.viewUrl}
                >
                  <Image
                    src={imgData.viewUrl}
                    alt="review_img"
                    fill
                    className="cover"
                  />
                </div>
              ))}
            </div>
          )}
          <div
            className="text-12 text-mainDarkGray whitespace-pre-line"
            dangerouslySetInnerHTML={{
              __html: data.reviewInfo?.reviewContent?.replace(/\n/g, '<br />'),
            }}
          />
          <article className="flex justify-between mt-[10px]">
            {data.reviewInfo?.createAt && (
              <p className="text-mainGray text-10">
                {formatDate(data.reviewInfo.createAt) as string}
              </p>
            )}
            <button
              className="cursor-pointer"
              onClick={() => {
                setIsOptionShow(true);
              }}
            >
              <Image
                src="/icon/ellipsis-darkgray.svg"
                width={14}
                height={14}
                alt="report"
              />
            </button>
          </article>
        </section>
        {data.reviewInfo?.tastingTagList?.length &&
          data.reviewInfo.tastingTagList.length !== 0 && (
            <FlavorTag
              tagList={data.reviewInfo.tastingTagList}
              styleClass="border-subCoral text-subCoral py-[5px] px-[10px] rounded-md text-12"
            />
          )}
        {shouldShowPriceOrLocation && (
          <section className="mx-5 py-5 space-y-2 border-b border-mainGray/30 text-12">
            {hasValidPrice && hasValidSizeType && (
              <div className="flex items-center space-x-[6px]">
                <Image
                  src={
                    data.reviewInfo.sizeType === 'BOTTLE'
                      ? '/bottle.svg'
                      : '/icon/glass-filled-subcoral.svg'
                  }
                  width={17}
                  height={17}
                  alt={
                    data.reviewInfo.sizeType === 'BOTTLE'
                      ? 'Bottle Price'
                      : 'Glass Price'
                  }
                />
                <p className="text-mainDarkGray font-bold">
                  {data.reviewInfo.sizeType === 'BOTTLE'
                    ? '병 가격 '
                    : '잔 가격'}
                </p>
                <p className="text-mainDarkGray font-normal">
                  {numberWithCommas(data.reviewInfo.price)}₩
                </p>
              </div>
            )}
            {hasValidLocation && (
              <div className="flex items-start space-x-[6px]">
                <Image
                  src="/icon/placepoint-subcoral.svg"
                  width={17}
                  height={17}
                  alt="address"
                />
                <p className="text-mainDarkGray font-bold">장소</p>
                <p className="text-mainDarkGray">
                  <>
                    <p>{data.reviewInfo?.locationInfo?.name}</p>
                    {data.reviewInfo?.locationInfo?.address}{' '}
                    {data.reviewInfo?.locationInfo?.detailAddress}{' '}
                    <a
                      href={data.reviewInfo?.locationInfo?.mapUrl || '#'}
                      onClick={(e) => {
                        e.preventDefault();
                        const mapUrl = data.reviewInfo?.locationInfo?.mapUrl;
                        if (mapUrl) {
                          window.open(mapUrl, '_blank', 'noopener,noreferrer');
                        }
                      }}
                      className="text-subCoral cursor-pointer"
                    >
                      지도보기
                    </a>
                  </>
                </p>
              </div>
            )}
          </section>
        )}
        <section className="mx-5 py-5 flex items-center space-x-4">
          <div className="flex-1 flex text-center justify-center items-center space-x-1">
            <LikeBtn
              size={16}
              reviewId={data?.reviewInfo?.reviewId}
              isLiked={isLiked}
              handleUpdateLiked={() => {
                setIsLiked((prev) => !prev);
                setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
              }}
              onApiSuccess={onRefresh}
              onApiError={() => {
                setLikeCount(data?.reviewInfo?.likeCount);
              }}
              handleNotLogin={handleLogin}
              likeBtnName="좋아요"
            />
            <div className="text-mainGray text-10">{likeCount}개</div>
          </div>

          <span className="border-[0.01rem] w-px border-mainGray opacity-40 h-4" />

          <button
            className="flex-1 flex text-center justify-center items-center space-x-1"
            onClick={() => {
              if (!isLogin) {
                handleLogin();
              } else {
                textareaRef.current?.focus();
              }
            }}
          >
            <Image
              src={
                data.reviewInfo?.hasReplyByMe
                  ? 'icon/comment-filled-subcoral.svg'
                  : '/icon/comment-outlined-gray.svg'
              }
              width={16}
              height={16}
              alt="comment"
            />
            <p className="relative w-fit text-mainGray font-bold text-13">
              댓글 작성
            </p>
          </button>

          <span className="border-[0.01rem] w-px border-mainGray opacity-40 h-4" />

          <button
            className="flex-1 flex text-center justify-center items-center space-x-1"
            onClick={() => {
              // shareOrCopy(
              //   `${process.env.NEXT_PUBLIC_BOTTLE_NOTE_URL}/review/${data.reviewInfo?.reviewId}`,
              // handleModalState,
              // );
              handleModalState({
                isShowModal: true,
                type: 'ALERT',
                mainText: '아직 준비 중인 기능입니다. 조금만 기다려주세요!',
              });
            }}
          >
            <Image
              src="/icon/externallink-outlined-gray.svg"
              alt="linkIcon"
              width={16}
              height={16}
            />
            <p className="text-mainGray font-bold text-13">공유</p>
          </button>
        </section>
      </section>
      {isOptionShow && (
        <OptionDropdown
          handleClose={() => setIsOptionShow(false)}
          options={
            userData?.userId === data.reviewInfo?.userInfo?.userId
              ? [
                  { name: '수정하기', type: 'MODIFY' },
                  { name: '삭제하기', type: 'DELETE' },
                ]
              : [
                  { name: '리뷰 신고', type: 'REVIEW_REPORT' },
                  { name: '유저 신고', type: 'USER_REPORT' },
                ]
          }
          handleOptionSelect={handleOptionSelect}
          title={
            userData?.userId === data.reviewInfo?.userInfo?.userId
              ? '내 리뷰'
              : '신고하기'
          }
        />
      )}
    </>
  );
}

export default ReviewDetails;

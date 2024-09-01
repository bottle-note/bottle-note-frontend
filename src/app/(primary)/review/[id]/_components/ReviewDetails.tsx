import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Label from '@/app/(primary)/_components/Label';
import { truncStr } from '@/utils/truncStr';
import Star from '@/components/Star';
import VisibilityToggle from '@/app/(primary)/_components/VisibilityToggle';
import FlavorTag from '@/app/(primary)/_components/FlavorTag';
import { numberWithCommas } from '@/utils/formatNum';
import { formatDate } from '@/utils/formatDate';
import { shareOrCopy } from '@/utils/shareOrCopy';
import LikeBtn from '@/app/(primary)/_components/LikeBtn';
import OptionDropdown from '@/components/OptionDropdown';
import useModalStore from '@/store/modalStore';
import { ReviewDetailsWithoutAlcoholInfo } from '@/types/Review';
import { deleteReview } from '@/lib/Review';
import ProfileDefaultImg from 'public/profile-default.svg';

interface Props {
  data: ReviewDetailsWithoutAlcoholInfo;
  handleLogin: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}

function ReviewDetails({ data, handleLogin, textareaRef }: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const { handleModalState, handleLoginModal } = useModalStore();
  const [isOptionShow, setIsOptionShow] = useState(false);
  const [isLiked, setIsLiked] = useState(data?.reviewResponse?.isLikedByMe);

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
          deleteReview(data.reviewResponse?.reviewId, handleCloseOption);
        },
      });
    } else if (option.type === 'MODIFY') {
      router.push(`/review/modify?reviewId=${data.reviewResponse?.reviewId}`);
    } else if (option.type === 'REPORT') {
      handleModalState({
        isShowModal: true,
        mainText: '준비 중인 기능입니다.',
      });
    } else if (option.type === 'USER_REPORT') {
      handleModalState({
        isShowModal: true,
        mainText: '준비 중인 기능입니다.',
      });
    }
  };

  return (
    <>
      <section>
        <section className="mx-5 py-5 space-y-4 border-b border-mainGray/30 ">
          <article className="flex items-center justify-between">
            <Link href={`/user/${session?.user?.userId}`}>
              <div className="flex items-center space-x-1 ">
                <div className="w-[1.9rem] h-[1.9rem] rounded-full overflow-hidden">
                  <Image
                    className="object-cover"
                    src={
                      data.reviewResponse?.userProfileImage ?? ProfileDefaultImg
                    }
                    alt="user_img"
                    width={30}
                    height={30}
                  />
                </div>
                <p className="text-mainGray text-13">
                  {data.reviewResponse?.nickName &&
                    truncStr(data.reviewResponse.nickName, 12)}
                </p>
              </div>
            </Link>
            <Star
              rating={data.reviewResponse?.rating ?? 0}
              size={25}
              style="text-20 text-subCoral font-semibold"
            />
          </article>
          <article className="flex space-x-2 items-center">
            {data.reviewResponse?.isBestReview && (
              <Label
                name="베스트"
                icon="/icon/thumbup-filled-white.svg"
                styleClass="bg-mainCoral text-white px-2 py-[0.1rem] border-mainCoral text-9 rounded"
              />
            )}
            {data.reviewResponse?.isMyReview && (
              <Label
                name="나의 코멘트"
                icon="/icon/user-outlined-subcoral.svg"
                styleClass="border-mainCoral text-mainCoral px-2 py-[0.1rem] text-9 rounded"
              />
            )}
            {data.reviewResponse?.userId === session?.user?.userId && (
              <VisibilityToggle
                initialStatus={data.reviewResponse.status === 'PUBLIC'}
                reviewId={data?.reviewResponse?.reviewId}
                handleNotLogin={handleLoginModal}
              />
            )}
          </article>
          {data.reviewImageList && (
            <div className="whitespace-nowrap overflow-x-auto flex space-x-2">
              {data.reviewImageList.map((imgData) => (
                <div
                  className="relative w-[147px] h-[147px]"
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
          <div className="text-10 text-mainDarkGray">
            {data.reviewResponse?.reviewContent}
          </div>
          <article className="flex justify-between">
            {data.reviewResponse?.createAt && (
              <p className="text-mainGray text-10">
                {formatDate(data.reviewResponse.createAt)}
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
                width={10}
                height={10}
                alt="report"
              />
            </button>
          </article>
        </section>
        {data.reviewResponse?.reviewTastingTag.length !== 0 && (
          <FlavorTag tagList={data.reviewResponse.reviewTastingTag} />
        )}
        {(data.reviewResponse?.address ||
          (!!data.reviewResponse?.price && data.reviewResponse?.sizeType)) && (
          <section className="mx-5 py-5 space-y-2 border-b border-mainGray/30 ">
            {data.reviewResponse?.price && data.reviewResponse?.sizeType && (
              <div className="flex items-center space-x-1">
                <Image
                  src={
                    data.reviewResponse.sizeType === 'BOTTLE'
                      ? '/bottle.svg'
                      : '/icon/glass-filled-subcoral.svg'
                  }
                  width={15}
                  height={15}
                  alt={
                    data.reviewResponse.sizeType === 'BOTTLE'
                      ? 'Bottle Price'
                      : 'Glass Price'
                  }
                />
                <p className="text-mainDarkGray text-10 font-semibold">
                  {data.reviewResponse.sizeType === 'BOTTLE'
                    ? '병 가격 '
                    : '잔 가격'}
                </p>
                <p className="text-mainDarkGray text-10 font-light">
                  {numberWithCommas(data.reviewResponse.price)}₩
                </p>
              </div>
            )}
            {/* 주소 형태 변경 예정으로 임시 적용 */}
            {data.reviewResponse?.address && (
              <div className="flex items-start space-x-1">
                <Image
                  src="/icon/placepoint-subcoral.svg"
                  width={15}
                  height={15}
                  alt="address"
                />
                <p className="text-mainDarkGray text-10 font-semibold">장소</p>
                <p className="text-mainDarkGray text-10">
                  <>
                    {data.reviewResponse?.zipCode}
                    <br />
                    {data.reviewResponse?.address}
                    <br />
                    {data.reviewResponse?.detailAddress}
                  </>
                </p>
              </div>
            )}
          </section>
        )}
        <section className="mx-5 py-5 flex items-center space-x-4">
          <div className="flex-1 flex text-center justify-center items-center space-x-1">
            <LikeBtn
              reviewId={data?.reviewResponse?.reviewId}
              isLiked={isLiked}
              handleUpdateLiked={() => setIsLiked((prev) => !prev)}
              handleError={() => {
                setIsLiked(data?.reviewResponse?.isLikedByMe);
              }}
              handleNotLogin={handleLogin}
              likeBtnName="좋아요"
              size={16}
            />
            <div className=" text-mainGray text-10 font-normal">
              좋아요 {data.reviewResponse?.likeCount}
            </div>
          </div>
          <span className="border-[0.01rem] w-px border-mainGray opacity-40 h-4" />
          <button
            className="flex-1 flex text-center justify-center items-center space-x-1"
            onClick={() => {
              if (!session) {
                handleLogin();
              } else {
                textareaRef.current?.focus();
              }
            }}
          >
            <Image
              src={
                data.reviewResponse?.hasReplyByMe
                  ? 'icon/comment-filled-subcoral.svg'
                  : '/icon/comment-outlined-gray.svg'
              }
              width={16}
              height={16}
              alt="comment"
            />
            <p className="relative w-fit text-mainGray font-bold text-10">
              댓글 작성
            </p>
          </button>
          <span className="border-[0.01rem] w-px border-mainGray opacity-40 h-4" />
          <button
            className="flex-1 flex text-center justify-center items-center space-x-1"
            onClick={() => {
              shareOrCopy(
                `${process.env.NEXT_PUBLIC_BOTTLE_NOTE_URL}/review/${data.reviewResponse?.reviewId}`,
                handleModalState,
              );
            }}
          >
            <Image
              src="/icon/externallink-outlined-gray.svg"
              alt="linkIcon"
              width={16}
              height={16}
            />
            <p className="text-mainGray font-bold text-10">공유</p>
          </button>
        </section>
      </section>
      {isOptionShow && (
        <OptionDropdown
          handleClose={() => setIsOptionShow(false)}
          options={
            session?.user?.userId === data.reviewResponse?.userId
              ? [
                  { name: '수정하기', type: 'MODIFY' },
                  { name: '삭제하기', type: 'DELETE' },
                ]
              : [
                  { name: '리뷰 신고', type: 'REPORT' },
                  { name: '유저 신고', type: 'USER_REPORT' },
                ]
          }
          handleOptionSelect={handleOptionSelect}
          title={
            session?.user?.userId === data.reviewResponse?.userId
              ? '내 리뷰'
              : '신고하기'
          }
        />
      )}
    </>
  );
}

export default ReviewDetails;

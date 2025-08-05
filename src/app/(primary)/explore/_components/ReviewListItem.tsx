import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ExploreReview } from '@/types/Explore';
import { UserInfoDisplay } from '@/components/UserInfoDisplay';
import Star from '@/components/Star';
import useModalStore from '@/store/modalStore';
import { formatDate } from '@/utils/formatDate';
import { AuthService } from '@/lib/AuthService';
import OptionDropdown from '@/components/OptionDropdown';
import { deleteReview } from '@/lib/Review';
import { ROUTES } from '@/constants/routes';
import {
  ReviewImageCarousel,
  convertImageUrlsToProductImageArray,
} from '@/app/(primary)/_components/ReviewImageCarousel';
import LikeBtn from '../../_components/LikeBtn';
import Label from '../../_components/Label';

interface Props {
  content: ExploreReview;
}

const ReviewListItem = ({ content }: Props) => {
  const router = useRouter();
  const { handleLoginModal, handleModalState } = useModalStore();
  const { isLogin, userData } = AuthService;
  const [isLiked, setIsLiked] = useState(content.isLikedByMe);
  const [likeCount, setLikeCount] = useState(content.likeCount);
  const [isReportOptionShow, setIsReportOptionShow] = useState(false);
  const productImages = convertImageUrlsToProductImageArray(
    content.reviewImages,
    '리뷰 이미지',
  );

  const handleCloseOption = () => {
    handleModalState({
      isShowModal: true,
      type: 'ALERT',
      mainText: '성공적으로 삭제되었습니다.',
      handleConfirm: () => {
        setIsReportOptionShow(false);
        handleModalState({
          isShowModal: false,
          mainText: '',
        });
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
          deleteReview(content.reviewId, handleCloseOption);
        },
      });
    } else if (option.type === 'MODIFY') {
      router.push(ROUTES.REVIEW.MODIFY(content.reviewId));
    } else if (option.type === 'REVIEW_REPORT') {
      router.push(ROUTES.REPORT.REVIEW(content.reviewId));
    } else if (option.type === 'USER_REPORT') {
      router.push(ROUTES.REPORT.USER(content.userInfo.userId));
    }
  };

  const moveToReviewDetail = () => {
    router.push(ROUTES.REVIEW.DETAIL(content.reviewId) + `?scrollTo=replies`);
  };

  return (
    <>
      <article className="flex flex-col w-full pt-[30px]">
        {/* 유저 정보 */}
        <div className="flex flex-col gap-[9px] mb-5">
          <div className="flex justify-between items-center w-full">
            <UserInfoDisplay
              userId={content.userInfo.userId}
              nickName={content.userInfo.nickName}
              userImageProps={{
                imgSrc: content.userInfo.userProfileImage,
                width: 30,
                height: 30,
              }}
              userNickNameProps={{
                size: 13,
                color: 'mainGray',
              }}
            />
            <Star
              rating={content.reviewRating ?? 0}
              size={21}
              textStyle="text-20 text-subCoral font-semibold w-7"
            />
          </div>
          <div className="flex justify-between items-center w-full">
            <Link href={ROUTES.SEARCH.ALL(content.alcoholId)}>
              <p className="text-12 text-mainDarkGray">{`${content.alcoholName}  >`}</p>
            </Link>

            <div className="flex gap-1">
              {content.isBestReview && (
                <Label
                  name="베스트"
                  icon="/icon/thumbup-filled-white.svg"
                  styleClass="bg-mainCoral text-white px-2 py-[0.1rem] border-mainCoral text-10 rounded"
                />
              )}
              {content.isMyReview && (
                <Label
                  name="나의 코멘트"
                  icon="/icon/user-outlined-subcoral.svg"
                  styleClass="border-mainCoral text-mainCoral px-2 py-[0.1rem] text-10 rounded"
                />
              )}
            </div>
          </div>
        </div>

        {/* 리뷰 본문 */}
        <Link href={ROUTES.REVIEW.DETAIL(content.reviewId)}>
          <div className="flex flex-col gap-[14px]">
            <ReviewImageCarousel images={productImages} />
            <p className="text-15 text-mainDarkGray">{content.reviewContent}</p>
            <div className="flex flex-wrap gap-[6px]">
              {content.reviewTags.map((tag) => (
                <div key={tag} className="overflow-hidden flex-shrink-0">
                  <Label name={tag} styleClass="label-default text-13" />
                </div>
              ))}
            </div>
          </div>
        </Link>

        {/* 리뷰 좋아요, 댓글 */}
        <div className="flex items-center justify-between mt-[14px]">
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-[2px]">
              <LikeBtn
                reviewId={content.reviewId}
                isLiked={isLiked}
                handleUpdateLiked={() => {
                  setIsLiked((prev) => !prev);
                  setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
                }}
                onApiError={() => {
                  setLikeCount(content.likeCount);
                  setIsLiked(content.isLikedByMe);
                }}
                handleNotLogin={handleLoginModal}
                size={17}
              />
              <p className="text-13 text-mainGray">{likeCount}</p>
            </div>
            <div
              className="flex items-center space-x-[2px] cursor-pointer"
              onClick={moveToReviewDetail}
              tabIndex={0}
              role="button"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  moveToReviewDetail();
                }
              }}
            >
              <Image
                src={
                  content.hasReplyByMe
                    ? '/icon/comment-filled-subcoral.svg'
                    : '/icon/comment-outlined-gray.svg'
                }
                width={17}
                height={17}
                alt="comment"
              />
              <p className="text-13 text-mainGray">{content.replyCount}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <p className="text-13 text-mainGray">
              {formatDate(content.createAt) as string}
            </p>
            <button
              className="cursor-pointer"
              onClick={() => {
                if (isLogin) setIsReportOptionShow(true);
                else handleLoginModal();
              }}
            >
              <Image
                src="/icon/ellipsis-darkgray.svg"
                width={17}
                height={17}
                alt="report"
              />
            </button>
          </div>
        </div>
      </article>
      {isReportOptionShow && (
        <OptionDropdown
          handleClose={() => setIsReportOptionShow(false)}
          options={
            userData?.userId === content.userInfo.userId
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
            userData?.userId === content.userInfo.userId
              ? '내 리뷰'
              : '신고하기'
          }
        />
      )}
    </>
  );
};

export default ReviewListItem;

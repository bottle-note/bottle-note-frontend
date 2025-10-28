import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ROUTES } from '@/constants/routes';
import { ExploreReview } from '@/types/Explore';
import UserInfoDisplay from '@/components/domain/user/UserInfoDisplay';
import Star from '@/components/ui/Display/Star';
import useModalStore from '@/store/modalStore';
import { formatDate } from '@/utils/formatDate';
import { useAuth } from '@/hooks/auth/useAuth';
import ReviewActionDropdown from '@/components/domain/review/ReviewActionDropdown';
import {
  ReviewImageCarousel,
  convertImageUrlsToProductImageArray,
} from '@/components/domain/review/ReviewImageCarousel';
import ReplyButton from '@/components/domain/review/ReplyButton';
import ReviewLikeButton from '@/components/domain/review/ReviewLikeButton';
import Label from '@/components/ui/Display/Label';

interface Props {
  content: ExploreReview;
}

const ReviewListItem = ({ content }: Props) => {
  const { handleLoginModal } = useModalStore();
  const { isLoggedIn, user: userData } = useAuth();
  const [isLiked, setIsLiked] = useState(content.isLikedByMe);
  const [likeCount, setLikeCount] = useState(content.likeCount);
  const [isReportOptionShow, setIsReportOptionShow] = useState(false);
  const productImages = convertImageUrlsToProductImageArray(
    content.reviewImages,
    '리뷰 이미지',
  );

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
                size: 30,
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
          <div className="flex justify-between items-start w-full gap-2">
            <Link
              href={ROUTES.SEARCH.ALL(content.alcoholId)}
              className="min-w-0 flex-1"
            >
              <p className="text-12 text-mainDarkGray break-words">{`${content.alcoholName}  >`}</p>
            </Link>

            <div className="flex gap-1 flex-shrink-0">
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
            <div
              className="text-15 text-mainDarkGray whitespace-pre-line break-words"
              dangerouslySetInnerHTML={{
                __html: content.reviewContent.replace(/\n/g, '<br />'),
              }}
            />
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
              <ReviewLikeButton
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
            <ReplyButton
              reviewId={content.reviewId}
              replyCount={content.replyCount}
              hasReplyByMe={content.hasReplyByMe}
              size={17}
              textSize="text-13"
            />
          </div>
          <div className="flex items-center space-x-1">
            <p className="text-13 text-mainGray">
              {formatDate(content.createAt) as string}
            </p>
            <button
              className="cursor-pointer"
              onClick={() => {
                if (isLoggedIn) setIsReportOptionShow(true);
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
      <ReviewActionDropdown
        isShow={isReportOptionShow}
        onClose={() => setIsReportOptionShow(false)}
        isOwnReview={userData?.userId === content.userInfo.userId}
        reviewId={String(content.reviewId)}
        userId={String(content.userInfo.userId)}
        userNickname={content.userInfo.nickName}
      />
    </>
  );
};

export default ReviewListItem;

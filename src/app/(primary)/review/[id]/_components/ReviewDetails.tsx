import React, { useState } from 'react';
import { MoreVertical } from 'lucide-react';
import FlavorTags from '@/components/domain/alcohol/FlavorTags';
import { ReviewDetailsWithoutAlcoholInfo } from '@/types/Review';
import { formatDate } from '@/utils/formatDate';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import ReviewActionDropdown from '@/components/domain/review/ReviewActionDropdown';
import {
  ReviewImageCarousel,
  convertImageUrlsToProductImageArray,
} from '@/components/domain/review/ReviewImageCarousel';
import ReviewUserHeader from './ReviewUserHeader';
import ReviewPriceLocation from './ReviewPriceLocation';
import ReviewInteractionBar from './ReviewInteractionBar';

interface Props {
  data: ReviewDetailsWithoutAlcoholInfo;
  alcoholId: number;
  handleLogin: () => void;
  onRefresh: () => void;
  textareaRef?: React.MutableRefObject<HTMLTextAreaElement | null>;
}

function ReviewDetails({
  data,
  alcoholId,
  handleLogin,
  onRefresh,
  textareaRef,
}: Props) {
  const { user: userData } = useAuthSession();
  const [isOptionShow, setIsOptionShow] = useState(false);
  const [isLiked, setIsLiked] = useState(data?.reviewInfo?.isLikedByMe);
  const [likeCount, setLikeCount] = useState(data?.reviewInfo?.likeCount);
  const formatUrl = data?.reviewImageList?.map((url) => url.viewUrl);
  const productImages = convertImageUrlsToProductImageArray(
    formatUrl,
    '리뷰 이미지',
  );

  return (
    <>
      <section className="pt-[38px]">
        <div className="mb-[10px]">
          <ReviewUserHeader data={data} onRefresh={onRefresh} />
        </div>
        <section className="mx-5 border-b border-stroke-neutral-subtle pb-5">
          {productImages?.length > 0 && (
            <div className="mb-[22px]">
              <ReviewImageCarousel images={productImages} priority />
            </div>
          )}
          <div
            className="whitespace-pre-line break-words text-15 text-fg-neutral"
            dangerouslySetInnerHTML={{
              __html: data.reviewInfo?.reviewContent?.replace(/\n/g, '<br />'),
            }}
          />
          <article className="flex items-center justify-between mt-[10px]">
            {data.reviewInfo?.createAt && (
              <p className="text-13 text-fg-neutral-muted">
                {formatDate(data.reviewInfo.createAt) as string}
              </p>
            )}
            <button
              className="cursor-pointer"
              onClick={() => setIsOptionShow(true)}
            >
              <MoreVertical
                aria-label="리뷰 메뉴"
                className="h-[18px] w-[18px] text-fg-neutral-muted"
              />
            </button>
          </article>
        </section>
        {data.reviewInfo?.tastingTagList?.length &&
          data.reviewInfo.tastingTagList.length !== 0 && (
            <FlavorTags
              tagList={data.reviewInfo.tastingTagList}
              styleClass="label-default py-[5px] px-[10px] rounded-md text-12"
            />
          )}

        {/* 가격 및 위치 정보 */}
        <ReviewPriceLocation data={data} />

        {/* 좋아요, 댓글, 공유 버튼 */}
        <ReviewInteractionBar
          data={data}
          isLiked={isLiked}
          likeCount={likeCount}
          onLikeUpdate={() => {
            setIsLiked((prev) => !prev);
            setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
          }}
          onLikeError={() => {
            setLikeCount(data?.reviewInfo?.likeCount);
            setIsLiked(data?.reviewInfo?.isLikedByMe);
          }}
          handleLogin={handleLogin}
          textareaRef={textareaRef}
        />
      </section>
      <ReviewActionDropdown
        isShow={isOptionShow}
        onClose={() => setIsOptionShow(false)}
        isOwnReview={userData?.userId === data.reviewInfo?.userInfo?.userId}
        reviewId={String(data.reviewInfo?.reviewId)}
        userId={String(data.reviewInfo?.userInfo?.userId)}
        userNickname={data.reviewInfo?.userInfo?.nickName}
        alcoholId={alcoholId}
      />
    </>
  );
}

export default ReviewDetails;

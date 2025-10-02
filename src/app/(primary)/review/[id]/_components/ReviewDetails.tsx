import React, { useState } from 'react';
import Image from 'next/image';
import FlavorTag from '@/app/(primary)/_components/FlavorTag';
import { ReviewDetailsWithoutAlcoholInfo } from '@/types/Review';
import { formatDate } from '@/utils/formatDate';
import { useAuth } from '@/hooks/auth/useAuth';
import ReviewActionDropdown from '@/app/(primary)/_components/ReviewActionDropdown';
import {
  ReviewImageCarousel,
  convertImageUrlsToProductImageArray,
} from '@/app/(primary)/_components/ReviewImageCarousel';
import ReviewUserHeader from './ReviewUserHeader';
import ReviewPriceLocation from './ReviewPriceLocation';
import ReviewActions from './ReviewActions';

interface Props {
  data: ReviewDetailsWithoutAlcoholInfo;
  handleLogin: () => void;
  onRefresh: () => void;
  textareaRef?: React.MutableRefObject<HTMLTextAreaElement | null>;
}

function ReviewDetails({ data, handleLogin, onRefresh, textareaRef }: Props) {
  const { user: userData } = useAuth();
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
        <div className="mb-[22px]">
          <ReviewUserHeader data={data} onRefresh={onRefresh} />
        </div>
        <section className="mx-5 pb-5 border-b border-mainGray/30">
          {productImages?.length > 0 && (
            <div className="mb-[22px]">
              <ReviewImageCarousel images={productImages} />
            </div>
          )}
          <div
            className="text-15 text-mainDarkGray whitespace-pre-line"
            dangerouslySetInnerHTML={{
              __html: data.reviewInfo?.reviewContent?.replace(/\n/g, '<br />'),
            }}
          />
          <article className="flex items-center justify-between mt-[10px]">
            {data.reviewInfo?.createAt && (
              <p className="text-mainGray text-13">
                {formatDate(data.reviewInfo.createAt) as string}
              </p>
            )}
            <button
              className="cursor-pointer"
              onClick={() => setIsOptionShow(true)}
            >
              <Image
                src="/icon/ellipsis-darkgray.svg"
                width={17.62}
                height={17.62}
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

        {/* 가격 및 위치 정보 */}
        <ReviewPriceLocation data={data} />

        {/* 좋아요, 댓글, 공유 버튼 */}
        <ReviewActions
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
        onRefresh={onRefresh}
      />
    </>
  );
}

export default ReviewDetails;

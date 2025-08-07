import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import FlavorTag from '@/app/(primary)/_components/FlavorTag';
import OptionDropdown from '@/components/OptionDropdown';
import useModalStore from '@/store/modalStore';
import { ReviewDetailsWithoutAlcoholInfo } from '@/types/Review';
import { formatDate } from '@/utils/formatDate';
import { deleteReview } from '@/lib/Review';
import { AuthService } from '@/lib/AuthService';
import { ROUTES } from '@/constants/routes';
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
}

function ReviewDetails({ data, handleLogin, onRefresh }: Props) {
  const router = useRouter();
  const { userData } = AuthService;
  const { handleModalState } = useModalStore();
  const [isOptionShow, setIsOptionShow] = useState(false);
  const [isLiked, setIsLiked] = useState(data?.reviewInfo?.isLikedByMe);
  const [likeCount, setLikeCount] = useState(data?.reviewInfo?.likeCount);
  const formatUrl = data?.reviewImageList?.map((url) => url.viewUrl);
  const productImages = convertImageUrlsToProductImageArray(
    formatUrl,
    '리뷰 이미지',
  );

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

  return (
    <>
      <section className="pt-[38px]">
        <ReviewUserHeader data={data} onRefresh={onRefresh} />
        <section className="mx-5 pb-5 border-b border-mainGray/30">
          {productImages?.length > 0 && (
            <div className="mb-[22px]">
              <ReviewImageCarousel images={productImages} />
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
              onClick={() => setIsOptionShow(true)}
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
        />
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

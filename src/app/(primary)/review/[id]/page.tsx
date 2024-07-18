'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { SubHeader } from '@/app/(primary)/_components/SubHeader';
import Label from '../../_components/Label';
import { truncStr } from '@/utils/truncStr';
import Star from '@/components/Star';
import Toggle from '@/app/(primary)/_components/Toggle';
import FlavorTag from '../../_components/FlavorTag';
import { numberWithCommas } from '@/utils/formatNum';
import OptionModal from '@/app/(primary)/_components/OptionModal';
import { ReviewApi } from '@/app/api/ReviewApi';
import { ReviewDetailsApi } from '@/types/Review';
import ProfileDefaultImg from 'public/profile-default.svg';
import { formatDate } from '@/utils/formatDate';
import EmptyView from '@/app/(primary)/_components/EmptyView';
import Comment from './_components/Comment';
import NavLayout from '@/app/(primary)/_components/NavLayout';

export default function ReviewDetail() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const reviewId = params?.id;
  const [data, setData] = useState<ReviewDetailsApi | null>(null);
  const [isPicked, setIsPicked] = useState<boolean>(false);
  const [isShow, setIsShow] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const result = await ReviewApi.getReviewDetails(reviewId);

      setData(result);
      setIsPicked(result.alcoholInfo.isPicked);
      setIsShow(result.reviewResponse.status === 'PRIVATE' ? false : true);
    })();
  }, [reviewId]);

  const [isOptionShow, setIsOptionShow] = useState(false);
  const handleOptionsShow = () => {
    setIsOptionShow((prev) => !prev);
  };

  const deleteReview = async () => {
    const result = await ReviewApi.deleteReview(reviewId as string);
    if (result) {
      alert('성공적으로 삭제되었습니다.');
      router.back();
    }
  };

  return (
    <NavLayout>
      <div className="relative pb-5">
        {data?.alcoholInfo?.imageUrl && (
          <div
            className={`absolute w-full h-full  bg-cover bg-center`}
            style={{ backgroundImage: `url(${data?.alcoholInfo?.imageUrl})` }}
          />
        )}
        <div className="absolute w-full h-full bg-mainCoral bg-opacity-90" />
        <SubHeader bgColor="bg-mainCoral/10">
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
          <SubHeader.Center textColor="text-white">
            리뷰 상세보기
          </SubHeader.Center>
          <SubHeader.Right onClick={() => {}}>
            {/* 브라우저는 복사, 핸드폰은 공유하기 */}
            <Image
              src="/icon/externallink-outlined-white.svg"
              alt="linkIcon"
              width={23}
              height={23}
            />
          </SubHeader.Right>
        </SubHeader>
        <section className="relative z-10 flex px-5 pb-6 space-x-5">
          <div className="rounded-lg w-1/3 bg-white p-4">
            <article className="relative h-[120px]">
              {data?.alcoholInfo?.imageUrl && (
                <Image
                  priority
                  src={data?.alcoholInfo?.imageUrl}
                  alt="img"
                  fill
                  className="object-contain"
                />
              )}
            </article>
          </div>
          <article className="w-2/3 py-3 text-white space-y-2 overflow-x-hidden">
            {data?.alcoholInfo && (
              <>
                <div className="space-y-1">
                  <Label
                    name={data.alcoholInfo.korCategoryName}
                    style={'border-white px-2 py-[0.15rem] rounded-md text-10'}
                  />
                  <h1 className="text-15 font-semibold whitespace-normal break-words">
                    {data.alcoholInfo.korName &&
                      truncStr(data.alcoholInfo.korName, 27)}
                  </h1>
                  <p className="text-13 whitespace-normal break-words">
                    {data.alcoholInfo.engName &&
                      truncStr(data.alcoholInfo.engName.toUpperCase(), 45)}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="border-[0.5px] border-white" />
                  <div className="flex space-x-3">
                    <div
                      className="text-10 flex"
                      onClick={() => {
                        data?.alcoholInfo?.alcoholId &&
                          router.push(
                            `/review/register?alcoholId=${data.alcoholInfo.alcoholId}`,
                          );
                      }}
                    >
                      <Image
                        className="mr-1"
                        src="/icon/edit-outlined-white.svg"
                        alt="write"
                        width={16}
                        height={16}
                      />
                      {/* 추후 user당 하루 리뷰 count 확인하는 API 연동 필요*/}
                      <button>리뷰 작성</button>
                    </div>
                    <div className="border-[0.5px] border-white my-[0.1rem]" />
                    <div className="text-10 flex">
                      <Image
                        className="mr-1"
                        src={`/icon/${isPicked ? 'like-filled-white.svg' : 'Like-outlined-white.svg'}`}
                        alt="like"
                        width={16}
                        height={16}
                      />
                      {/* post api 연결 필요 */}
                      <button>찜하기</button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </article>
        </section>
      </div>
      <section className="mx-5 py-5 space-y-4 border-b border-mainGray/30 ">
        <article className="space-y-1">
          <div className="flex items-center justify-between">
            {/* 확인 필요 */}
            {/* <Link href={`/user/${userId}`}> */}
            <div className="flex items-center space-x-1 ">
              <div className="w-[1.9rem] h-[1.9rem] rounded-full overflow-hidden">
                <Image
                  className="object-cover"
                  src={
                    data?.reviewResponse?.userProfileImage ?? ProfileDefaultImg
                  }
                  alt="user_img"
                  width={30}
                  height={30}
                />
              </div>
              <p className="text-mainGray text-13">
                {data?.reviewResponse?.nickName &&
                  truncStr(data.reviewResponse.nickName, 12)}
              </p>
            </div>
            {/* </Link> */}
            <Star
              rating={data?.reviewResponse?.rating ?? 0}
              size={25}
              style={'text-20 text-subCoral font-semibold'}
            />
          </div>
          <div className="flex space-x-2">
            {/* {isBest && ( */}
            <Label
              name="베스트"
              icon="/icon/thumbup-filled-white.svg"
              style="bg-mainCoral text-white px-2 py-[0.1rem] border-mainCoral text-9 rounded"
            />
            {/* )} */}
            {data?.reviewResponse?.isMyReview && (
              <Label
                name="나의 코멘트"
                icon="/icon/user-outlined-subcoral.svg"
                style="border-mainCoral text-mainCoral px-2 py-[0.1rem] text-9 rounded"
              />
            )}
            {/* 동일한 user일 때만 보여주는 조건 추가 필요 */}
            <Toggle
              defaultState={isShow}
              onChange={(value) => {
                setIsShow(value);
                // api 적용 필요
                // const status = value ? 'PUBLIC' : 'PRIVATE';
              }}
              offValue="리뷰 비공개"
              onValue="리뷰 공개"
            />
          </div>
        </article>
        {data?.reviewImageList && (
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
          {data?.reviewResponse?.reviewContent}
        </div>
        <div className="flex justify-between">
          {data?.reviewResponse?.createAt && (
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
              src={'/icon/ellipsis-darkgray.svg'}
              width={10}
              height={10}
              alt="report"
            />
          </button>
        </div>
      </section>
      {data?.reviewResponse?.reviewTastingTag &&
        data.reviewResponse.reviewTastingTag.length !== 0 && (
          <FlavorTag tagList={data.reviewResponse.reviewTastingTag} />
        )}
      <section className="mx-5 py-5 space-y-2 border-b border-mainGray/30 ">
        {data?.reviewResponse?.price && data?.reviewResponse?.sizeType && (
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
        {data?.reviewResponse?.address && (
          <div className="flex items-start space-x-1">
            <Image
              src={'/icon/placepoint-subcoral.svg'}
              width={15}
              height={15}
              alt={'address'}
            />
            <p className="text-mainDarkGray text-10 font-semibold">장소</p>
            <p className="text-mainDarkGray text-10">
              {
                <>
                  {data?.reviewResponse?.zipCode}
                  <br />
                  {data?.reviewResponse?.address}
                  <br />
                  {data?.reviewResponse?.detailAddress}
                </>
              }
            </p>
          </div>
        )}
      </section>
      <section className="mx-5 py-5 flex items-center space-x-4">
        <div className="flex-1 flex text-center justify-center items-center space-x-1">
          <Image
            src={
              data?.reviewResponse?.isLikedByMe
                ? '/icon/thumbup-filled-subcoral.svg'
                : '/icon/thumbup-outlined-gray.svg'
            }
            width={16}
            height={16}
            alt="like"
          />
          <div className="text-mainGray font-bold text-10">좋아요</div>
          <div className=" text-mainGray text-10 font-normal">
            좋아요 {data?.reviewResponse?.likeCount}
          </div>
        </div>
        <span className="border-[0.01rem] w-px border-mainGray opacity-40 h-4" />
        <div className="flex-1 flex text-center justify-center items-center space-x-1">
          <Image
            src={
              data?.reviewResponse?.hasReplyByMe
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
        </div>
        <span className="border-[0.01rem] w-px border-mainGray opacity-40 h-4" />
        <div className="flex-1 flex text-center justify-center items-center space-x-1">
          <Image
            src={'/icon/externallink-outlined-gray.svg'}
            alt="linkIcon"
            width={16}
            height={16}
          />
          {/* 기능 추가 필요 */}
          <p className="text-mainGray font-bold text-10">공유</p>
        </div>
      </section>
      {(data?.reviewReplyList ?? []).length !== 0 ? (
        <>
          <div className="h-4 bg-sectionWhite" />
          <section className="mx-5 py-5 space-y-4">
            {data?.reviewReplyList?.map((comment, index) => (
              <React.Fragment key={comment.userId + index}>
                <Comment data={comment} />
                {index !== data?.reviewReplyList?.length - 1 && (
                  <div className="border-b border-mainGray/30" />
                )}
              </React.Fragment>
            ))}
          </section>
        </>
      ) : (
        <>
          <div className="h-4 bg-sectionWhite" />
          <section className="py-5">
            <EmptyView text="아직 댓글이 없어요!" />
          </section>
        </>
      )}
      {isOptionShow && (
        <OptionModal
          options={
            session?.user?.userId === data?.reviewResponse?.userId
              ? [
                  {
                    name: '수정하기',
                    path: `/review/modify?reviewId=${data?.reviewResponse?.reviewId}`,
                  },
                  {
                    name: '삭제하기',
                    action: () => {
                      const result = confirm('정말 삭제하시겠습니까?');
                      if (result) deleteReview();
                    },
                  },
                ]
              : [
                  { name: '리뷰 신고', path: '' },
                  { name: '유저 신고', path: '' },
                ]
          }
          type={
            session?.user?.userId === data?.reviewResponse?.userId
              ? '리뷰'
              : '신고하기'
          }
          handleClose={handleOptionsShow}
        />
      )}
    </NavLayout>
  );
}

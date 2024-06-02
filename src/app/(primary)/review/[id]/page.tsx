'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { SubHeader } from '@/app/(primary)/_components/SubHeader';
import Label from '../../_components/Label';
import { truncStr } from '@/utils/truncStr';
import Link from 'next/link';
import Star from '@/components/Star';
import Toggle from '@/app/(primary)/_components/Toggle';
import FlavorTag from '../../_components/FlavorTag';
import { numberWithCommas } from '@/utils/formatNum';
import ReportModal from '@/app/(primary)/_components/ReportModal';

import dummyImg from '/public/whiskey_img1.png';
import userImg from 'public/user_img.png';
import Comment from './_components/Comment';

export default function ReviewDetail() {
  const router = useRouter();
  const engName = '1770 Glasgow Single Malt';
  const sizeType = 'bottle';
  const commentList = [
    {
      userId: '1',
      nickName: '테스트입니당',
      comment: '오! 색다른 평이네요!!',
      createAt: '2024-05-18T20:41:16',
      userImg,
    },
    {
      userId: '2',
      nickName: '테스트입니당와우와우와우와우와우와',
      comment: '오! 저장해놔야겠어요!!',
      createAt: '2024-05-18T20:41:16',
      userImg,
    },
  ];

  const [isOptionShow, setIsOptionShow] = useState(false);
  const handleOptionsShow = () => {
    setIsOptionShow((prev) => !prev);
  };

  return (
    <>
      <div className="relative">
        {/* {data?.alcohols?.alcoholUrlImg && ( */}
        <div
          className={`absolute w-full h-full  bg-cover bg-center`}
          style={{ backgroundImage: `${dummyImg}` }}
          // style={{ backgroundImage: `url(${dummyImg})` }}
        />
        {/* )} */}
        <div className="absolute w-full h-full bg-mainCoral bg-opacity-90" />
        <SubHeader bgColor="bg-mainCoral/10">
          <SubHeader.Left
            onClick={() => {
              router.back();
            }}
          >
            <Image
              src="/arrow-left-white.svg"
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
              src="/externallink-outlined-white.svg"
              alt="linkIcon"
              width={23}
              height={23}
            />
          </SubHeader.Right>
        </SubHeader>
        <section className="relative z-10 flex px-5 pb-6 space-x-5">
          <div className="rounded-lg flex-1 bg-white p-4 h-40">
            <article className="relative h-32 w-[4.5rem]">
              {/* {data?.alcohols?.alcoholUrlImg && ( */}
              <Image
                priority
                className="max-w-full max-h-full"
                src={dummyImg}
                alt="img"
                width={200}
                height={200}
              />
              {/* )} */}
            </article>
          </div>
          <article className="flex-2 py-3 text-white space-y-2 overflow-x-hidden">
            {/* {data?.alcohols && ( */}
            <>
              <div className="space-y-1">
                <Label name={'싱글몰트'} />
                <h1 className="text-xl font-semibold whitespace-normal break-words">
                  {truncStr('글래스고 1770 싱글몰트 스카치 위스키', 27)}
                  {/* {data.alcohols.korName && truncStr(data.alcohols.korName, 27)} */}
                </h1>
                <p className="text-xs whitespace-normal break-words">
                  {/* {data.alcohols.engName && */}
                  {truncStr(engName.toUpperCase(), 45)}
                  {/* } */}
                </p>
              </div>
              <div className="space-y-1">
                <div className="border-[0.5px] border-white" />
                <div className="flex space-x-3">
                  <div
                    className="text-xs flex"
                    onClick={() => {
                      router.push('/review/register');
                    }}
                  >
                    <Image
                      className="mr-1"
                      src="/edit-outlined-white.svg"
                      alt="write"
                      width={16}
                      height={16}
                    />
                    <button>리뷰 작성</button>
                  </div>
                  <div className="border-[0.5px] border-white my-[0.1rem]" />
                  <div className="text-xs flex">
                    <Image
                      className="mr-1"
                      src="/like-filled-subcoral-white.svg"
                      alt="like"
                      width={16}
                      height={16}
                    />
                    <button>찜하기</button>
                  </div>
                </div>
              </div>
            </>
            {/* )} */}
          </article>
        </section>
      </div>
      <section className="mx-5 py-5 space-y-4 border-b border-mainGray/30 ">
        <div className="flex items-center justify-between">
          {/* <Link href={`/user/${userId}`}> */}
          <div className="flex items-center space-x-1">
            <div className="w-7 h-7 rounded-full overflow-hidden">
              <Image
                className="object-cover"
                src={userImg}
                alt="user_img"
                width={28}
                height={28}
              />
            </div>
            <p className="text-mainGray text-xs">{truncStr('nickName', 12)}</p>
          </div>
          {/* </Link> */}
          <Star rating={3.5} size={20} />
        </div>
        <div className="flex space-x-2">
          {/* {isBest && ( */}
          <Label
            name="베스트"
            icon="/thumbup-filled-white.svg"
            style="bg-mainCoral text-white px-2 py-[0.1rem] border-mainCoral text-xxs rounded"
          />
          {/* )} */}
          {/* {isMine && ( */}
          <Label
            name="나의 코멘트"
            icon="/user-outlined-subcoral.svg"
            style="border-mainCoral text-mainCoral px-2 py-[0.1rem] text-xxs rounded"
          />
          {/* )} */}
          <Toggle
            defaultState={false}
            // defaultState={status === 'PUBLIC'}
            offValue="리뷰 비공개"
            onValue="리뷰 공개"
          />
        </div>
        <div>
          <div className="whitespace-nowrap overflow-x-auto flex space-x-2">
            {/* 이미지 API 완성되면 수정 예정 */}
            <div className="min-w-[147px]">
              <Image src={dummyImg} alt="user_img" width={147} height={147} />
            </div>
            <div className="min-w-[147px]">
              <Image src={dummyImg} alt="user_img" width={147} height={147} />
            </div>
            <div className="min-w-[147px]">
              <Image src={dummyImg} alt="user_img" width={147} height={147} />
            </div>
          </div>
        </div>
        <div className="text-xs text-mainDarkGray">
          쉐리캐스크 특유의 쫀득한 텍스쳐와 건포도의 향의 밸런스가 좋습니다.
          쉐리캐스크 숙성의 독특한 특성이 잘 드러나며, 입안에서 느껴지는
          쫀득함과 풍부한 건포도 향이 조화를 이룹니다. 특히 쉐리캐스크의
          영향으로 깊고 복합적인 맛이 강조되며, 고급스러운 느낌을 줍니다. 여러
          차례 맛을 봐도 질리지 않는 매력을 지니고 있어, 지속적으로 즐길 수 있는
          술입니다. 이러한 특성 덕분에 쉐리캐스크 숙성의 위스키는 많은 애호가들
          사이에서 인기가 높습니다. 건포도의 달콤함과 쫀득한 질감이 어우러져
          감각을 자극하며, 끝맛까지 길게 남는 여운이 인상적입니다. 쉐리캐스크의
          풍미를 좋아하는 분들에게는 이 위스키가 최상의 선택이 될 것입니다. 이
          위스키를 음미하면서 느껴지는 복합적인 향과 맛의 조화는 정말로 독특하고
          매력적입니다. 쉐리캐스크 특유의 쫀득한 텍스쳐와 건포도의 향의 밸런스가
          훌륭하며, 마시는 내내 감탄하게 되는 경험을 선사합니다.
        </div>
        <div className="flex justify-between">
          <p className="text-mainGray text-xxs">2024.05.01</p>
          {/* <p>{formatDate(createAt)}</p> */}
          <button
            className="cursor-pointer"
            onClick={() => {
              setIsOptionShow(true);
            }}
          >
            <Image
              src={'/ellipsis-darkgray.svg'}
              width={10}
              height={10}
              alt="report"
            />
          </button>
        </div>
      </section>
      <FlavorTag tagList={['사과', '오크', '청포도']} />
      <section className="mx-5 py-5 space-y-2 border-b border-mainGray/30 ">
        <div className="flex items-center space-x-1">
          <Image
            src={
              sizeType === 'bottle'
                ? '/bottle.svg'
                : '/glass-filled-subcoral.svg'
            }
            width={12}
            height={12}
            alt={sizeType === 'bottle' ? 'Bottle Price' : 'Glass Price'}
          />
          <p className="text-mainDarkGray text-xxs font-semibold">
            {sizeType === 'bottle' ? '병 가격 ' : '잔 가격'}
          </p>
          <p className="text-mainDarkGray text-xxs font-light">
            {numberWithCommas(123000)}₩
          </p>
        </div>
        <div className="flex items-start space-x-1">
          <Image
            src={'/placepoint-subcoral.svg'}
            width={12}
            height={12}
            alt={'address'}
          />
          <p className="text-mainDarkGray text-xxs font-semibold">장소</p>
          <p className="text-mainDarkGray text-xxs font-light">
            {
              <>
                Address1
                <br />
                Address2
              </>
            }
          </p>
        </div>
      </section>
      <section className="mx-5 py-5 flex items-center space-x-4">
        <div className="flex-1 flex text-center justify-center items-center space-x-1">
          <Image
            src={'/thumbup-outlined-gray.svg'}
            // src={isMyLike ? '/thumbup-filled-subcoral.svg' : '/thumbup-outlined-gray.svg'}
            width={16}
            height={16}
            alt="like"
          />
          <div className="text-mainGray font-bold text-xs">좋아요</div>
          <div className=" text-mainGray text-xxs font-normal">좋아요 32</div>
        </div>
        <span className="border-[0.01rem] w-px border-mainGray opacity-40 h-4" />
        <div className="flex-1 flex text-center justify-center items-center space-x-1">
          <Image
            src={'/comment-outlined-gray.svg'}
            width={16}
            height={16}
            alt="comment"
          />
          <p className="relative w-fit text-mainGray font-bold text-xs">
            댓글 작성
          </p>
        </div>
        <span className="border-[0.01rem] w-px border-mainGray opacity-40 h-4" />
        <div className="flex-1 flex text-center justify-center items-center space-x-1">
          <Image
            src={'/externallink-outlined-whiteGray.svg'}
            alt="linkIcon"
            width={16}
            height={16}
          />
          <p className="text-mainGray font-bold text-xs">공유</p>
        </div>
      </section>
      {commentList.length !== 0 && (
        <>
          <div className="h-4 bg-sectionWhite" />
          <section className="mx-5 py-5 space-y-4">
            {commentList.map((comment, index) => (
              <React.Fragment key={comment.userId + index}>
                <Comment data={comment} />
                {index !== commentList.length - 1 && (
                  <div className="border-b border-mainGray/30" />
                )}
              </React.Fragment>
            ))}
          </section>
        </>
      )}
      {isOptionShow && <ReportModal handleClose={handleOptionsShow} />}
    </>
  );
}

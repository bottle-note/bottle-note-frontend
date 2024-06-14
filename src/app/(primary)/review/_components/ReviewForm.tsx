'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import StarRating from '@/components/StarRaiting';
import Toggle from '@/app/(primary)/_components/Toggle';
import Label from '../../_components/Label';
import FlavorTag from '../../_components/FlavorTag';
import Link from 'next/link';

// 값이 있을 때에 대한 분기는 추후 API 연결하면서 같이 작업 예정
interface Props {}

function ReviewForm() {
  const router = useRouter();
  const TAG_DATA = [
    '스파이시',
    '포도',
    '시나몬',
    '호두',
    '바닐라',
    '건포도',
    '시원함',
    '달콤함',
  ];
  return (
    <section className="px-5 pt-9 pb-20">
      <article className="grid place-items-center space-y-2 pb-3">
        <p className="text-xxs text-mainDarkGray">
          이 술에 대한 평가를 남겨보세요.
        </p>
        {/* 추후 로직 확인 후 수정 필요 */}
        <div>
          <StarRating size={40} />
        </div>
      </article>
      <div className="border-b border-mainGray/30 my-3" />
      <article>
        <textarea
          placeholder="이 위스키에 대한 리뷰를 작성해보세요. (최대 1,000자)"
          className="text-xxs w-full h-48"
        />
        <div className="text-xxs text-mainGray flex justify-between items-center">
          <Toggle />
          <div>(0/1000)</div>
        </div>
      </article>
      <div className="border-b border-mainGray/30 my-3" />
      <article className="grid grid-cols-3">
        <div className="flex items-start space-x-1 col-span-1">
          <Image
            src="/icon/money-subcoral.svg"
            alt="moneyIcon"
            width={20}
            height={20}
          />
          <p className="text-xxs text-mainDarkGray font-bold">
            가격 <span className="text-mainGray font-normal">(선택)</span>
          </p>
        </div>
        <div className="col-span-2">
          <div className="flex items-center space-x-3">
            <label
              htmlFor="glass"
              className="flex items-center text-mainDarkGray text-xxs"
            >
              <input
                type="radio"
                className="mr-1"
                id="glass"
                name="cost"
                value="glass"
              />
              1잔
            </label>
            <label
              htmlFor="bottle"
              className="flex items-center text-mainDarkGray text-xxs"
            >
              <input
                type="radio"
                className="mr-1"
                id="bottle"
                name="cost"
                value="bottle"
              />
              보틀(1병)
            </label>
          </div>
          <div className="border-b border-subCoral py-2 flex items-center">
            <p className="text-subCoral text-xxs font-semibold w-8">1병에</p>
            <input
              type="number"
              placeholder="얼마에 마셨는지 기록해보세요!"
              className="text-xxs font-[#BFBFBF] w-full text-mainDarkGray text-right"
            />
            <Image
              src="/icon/won-subcoral.svg"
              alt="wonIcon"
              width={15}
              height={15}
            />
          </div>
        </div>
      </article>
      <div className="border-b border-mainGray/30 my-3" />
      <article className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <Image
            src="/icon/marker-subcoral.svg"
            alt="placeIcon"
            width={20}
            height={20}
          />
          <p className="text-xxs text-mainDarkGray font-bold">
            이 술을 마셨을 때, 좋았던 장소가 있나요?{' '}
            <span className="text-mainGray font-normal">(선택)</span>
          </p>
        </div>
        <div className="flex items-center">
          <p className="text-mainGray font-normal text-xxs">변경</p>
          <Image
            src="/icon/arrow-right-subcoral.svg"
            alt="rightIcon"
            width={18}
            height={18}
          />
        </div>
      </article>
      <div className="border-b border-mainGray/30 my-3" />
      <article className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <Image
            src="/icon/photo-subcoral.svg"
            alt="placeIcon"
            width={20}
            height={20}
          />
          <p className="text-xxs text-mainDarkGray font-bold">
            이미지 추가{' '}
            <span className="text-mainGray font-normal">(선택·최대 5장)</span>
          </p>
        </div>
        <div className="flex items-center">
          <p className="text-mainGray font-normal text-xxs">이미지 수정</p>
          <Image
            src="/icon/arrow-right-subcoral.svg"
            alt="rightIcon"
            width={18}
            height={18}
          />
        </div>
      </article>
      <div className="border-b border-mainGray/30 my-3" />
      <article className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Image
              src="/icon/success-subcoral.svg"
              alt="placeIcon"
              width={20}
              height={20}
            />
            <p className="text-xxs text-mainDarkGray font-bold">
              FLAVOR TAG 입력하기{' '}
              <span className="text-mainGray font-normal">(선택)</span>
            </p>
            <p className="text-xxs text-mainDarkGray">총 8개 선택</p>
          </div>
          <div className="flex items-center">
            <p className="text-mainGray font-normal text-xxs">수정</p>
            <Link href="/review/register/flavorTag">
              <Image
                src="/icon/arrow-right-subcoral.svg"
                alt="rightIcon"
                width={18}
                height={18}
              />
            </Link>
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {TAG_DATA.map((tag) => (
            <React.Fragment key={tag}>
              <Label
                name={tag}
                style={
                  'border-subCoral text-subCoral px-2 py-0.5 rounded-md text-xs'
                }
              />
            </React.Fragment>
          ))}
        </div>
      </article>
      <div className="border-b border-mainGray/30 my-3" />
      <article className="px-5 fixed bottom-2 center left-0 right-0">
        <div className="flex justify-center items-center w-full h-[3.8rem] bg-subCoral rounded-xl text-white font-bold text-base">
          리뷰 등록
        </div>
      </article>
    </section>
  );
}

export default ReviewForm;

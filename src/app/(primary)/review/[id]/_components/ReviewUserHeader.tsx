import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Label from '@/app/(primary)/_components/Label';
import { truncStr } from '@/utils/truncStr';
import Star from '@/components/Star';
import VisibilityToggle from '@/app/(primary)/_components/VisibilityToggle';
import { formatDate } from '@/utils/formatDate';
import { ReviewDetailsWithoutAlcoholInfo } from '@/types/Review';
import { AuthService } from '@/lib/AuthService';
import { ROUTES } from '@/constants/routes';
import ProfileDefaultImg from 'public/profile-default.svg';

interface ReviewUserHeaderProps {
  data: ReviewDetailsWithoutAlcoholInfo;
  onRefresh: () => void;
  onOptionClick: () => void;
}

export default function ReviewUserHeader({
  data,
  onRefresh,
  onOptionClick,
}: ReviewUserHeaderProps) {
  const { userData } = AuthService;

  return (
    <section className="mx-5 pb-5 border-b border-mainGray/30">
      <article className="flex items-center justify-between">
        <Link href={ROUTES.USER.BASE(userData?.userId!)}>
          <div className="flex items-center space-x-[7px]">
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
            handleNotLogin={() => {}}
            onSuccess={onRefresh}
          />
        )}
      </article>

      <article className="flex justify-between mt-[10px]">
        {data.reviewInfo?.createAt && (
          <p className="text-mainGray text-10">
            {formatDate(data.reviewInfo.createAt) as string}
          </p>
        )}
        <button className="cursor-pointer" onClick={onOptionClick}>
          <Image
            src="/icon/ellipsis-darkgray.svg"
            width={14}
            height={14}
            alt="report"
          />
        </button>
      </article>
    </section>
  );
}

import React from 'react';
import Link from 'next/link';
import Label from '@/app/(primary)/_components/Label';
import { truncStr } from '@/utils/truncStr';
import Star from '@/components/Star';
import VisibilityToggle from '@/app/(primary)/_components/VisibilityToggle';
import { ReviewDetailsWithoutAlcoholInfo } from '@/types/Review';
import ProfileImage from '@/app/(primary)/_components/ProfileImage';
import { useAuth } from '@/hooks/auth/useAuth';
import { ROUTES } from '@/constants/routes';

interface ReviewUserHeaderProps {
  data: ReviewDetailsWithoutAlcoholInfo;
  onRefresh: () => void;
}

export default function ReviewUserHeader({
  data,
  onRefresh,
}: ReviewUserHeaderProps) {
  const { user: userData } = useAuth();

  return (
    <section className="mx-5">
      <article className="flex items-center justify-between">
        <Link href={ROUTES.USER.BASE(userData?.userId!)}>
          <div className="flex items-center space-x-[7px]">
            <ProfileImage size={30} />
            <p className="text-mainGray text-13">
              {data.reviewInfo?.userInfo?.nickName &&
                truncStr(data.reviewInfo.userInfo.nickName, 12)}
            </p>
          </div>
        </Link>
        <Star
          rating={data.reviewInfo?.rating ?? 0}
          size={27}
          textStyle="text-24 text-subCoral font-semibold min-w-7"
        />
      </article>

      <article className="flex items-center justify-between mt-[10px]">
        <div className="flex items-center space-x-1">
          {data.reviewInfo?.isBestReview && (
            <Label
              name="베스트"
              icon="/icon/thumbup-filled-white.svg"
              iconHeight={11.45}
              iconWidth={11.45}
              styleClass="bg-mainCoral text-white px-2 py-[3px] border-mainCoral text-10 rounded"
            />
          )}
          {data.reviewInfo?.isMyReview && (
            <Label
              name="나의 코멘트"
              icon="/icon/user-outlined-subcoral.svg"
              iconHeight={11.45}
              iconWidth={11.45}
              styleClass="border-mainCoral text-mainCoral px-2 py-[3px] text-10 rounded"
            />
          )}
        </div>
        {data.reviewInfo?.userInfo?.userId === userData?.userId && (
          <VisibilityToggle
            initialStatus={data.reviewInfo.status === 'PUBLIC'}
            reviewId={data?.reviewInfo?.reviewId}
            handleNotLogin={() => {}}
            onSuccess={onRefresh}
            textSize="text-13"
          />
        )}
      </article>
    </section>
  );
}

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Label from '@/app/(primary)/_components/Label';
import { truncStr } from '@/utils/truncStr';
import Star from '@/components/Star';
import VisibilityToggle from '@/app/(primary)/_components/VisibilityToggle';
import { ReviewDetailsWithoutAlcoholInfo } from '@/types/Review';
import { useAuth } from '@/hooks/auth/useAuth';
import { ROUTES } from '@/constants/routes';
import ProfileDefaultImg from 'public/profile-default.svg';

interface ReviewUserHeaderProps {
  data: ReviewDetailsWithoutAlcoholInfo;
  onRefresh: () => void;
}

export default function ReviewUserHeader({
  data,
  onRefresh,
}: ReviewUserHeaderProps) {
  const { user: userData } = useAuth();

  return (
    <section className="mx-5">
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
          size={27}
          textStyle="text-24 text-subCoral font-semibold min-w-7"
        />
      </article>

      <article className="flex items-center justify-between mt-[10px]">
        <div className="flex items-center space-x-1">
          {data.reviewInfo?.isBestReview && (
            <Label
              name="베스트"
              icon="/icon/thumbup-filled-white.svg"
              iconHeight={11.45}
              iconWidth={11.45}
              styleClass="bg-mainCoral text-white px-2 py-[3px] border-mainCoral text-10 rounded"
            />
          )}
          {data.reviewInfo?.isMyReview && (
            <Label
              name="나의 코멘트"
              icon="/icon/user-outlined-subcoral.svg"
              iconHeight={11.45}
              iconWidth={11.45}
              styleClass="border-mainCoral text-mainCoral px-2 py-[3px] text-10 rounded"
            />
          )}
        </div>
        {data.reviewInfo?.userInfo?.userId === userData?.userId && (
          <VisibilityToggle
            initialStatus={data.reviewInfo.status === 'PUBLIC'}
            reviewId={data?.reviewInfo?.reviewId}
            handleNotLogin={() => {}}
            onSuccess={onRefresh}
            textSize="text-13"
          />
        )}
      </article>
    </section>
  );
}

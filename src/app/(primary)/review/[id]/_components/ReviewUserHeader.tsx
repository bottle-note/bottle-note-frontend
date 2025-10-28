import React from 'react';
import Link from 'next/link';
import Label from '@/components/ui/Display/Label';
import { truncStr } from '@/utils/truncStr';
import Star from '@/components/ui/Display/Star';
import VisibilityToggle from '@/components/ui/Form/VisibilityToggle';
import { ReviewDetailsWithoutAlcoholInfo } from '@/types/Review';
import ProfileImage from '@/components/domain/user/ProfileImage';
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
      {(data.reviewInfo?.isBestReview || data.reviewInfo?.isMyReview) && (
        <article className="flex items-center justify-between mt-[10px] mb-[22px]">
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
      )}
    </section>
  );
}

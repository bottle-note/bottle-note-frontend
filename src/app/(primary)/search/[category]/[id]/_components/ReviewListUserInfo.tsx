import React from 'react';
import Link from 'next/link';
import Label from '@/components/ui/Display/Label';
import ProfileImage from '@/components/domain/user/ProfileImage';
import SemanticIcon from '@/components/ui/Display/SemanticIcon';
import useRelationshipsStore from '@/store/relationshipsStore';
import { truncStr } from '@/utils/truncStr';
import Star from '@/components/ui/Display/Star';
import { ROUTES } from '@/constants/routes';
import { LABEL_NAMES } from '@/constants/common';

interface ReviewListUserInfoProps {
  userInfo: {
    userId: number;
    nickName: string;
    userProfileImage?: string | null;
  };
  rating?: number | null;
  isBestReview?: boolean;
  isMyReview?: boolean;
  userImageSize?: number;
  userNameSize?: string;
  starSize?: number;
  starTextStyle?: string;
  className?: string;
}

export default function ReviewListUserInfo({
  userInfo,
  rating,
  isBestReview,
  isMyReview,
  userImageSize = 22,
  userNameSize = 'text-12',
  starSize = 22,
  starTextStyle = 'min-w-5 text-20 font-semibold text-fg-rating',
  className = '',
}: ReviewListUserInfoProps) {
  const { isUserBlocked } = useRelationshipsStore();
  const isBlocked = isUserBlocked(String(userInfo.userId));

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center space-x-2">
        <Link href={ROUTES.USER.BASE(userInfo.userId)}>
          <div className="flex items-center space-x-1">
            {isBlocked ? (
              <>
                <div className="h-[22px] w-[22px] rounded-full bg-bg-disabled" />

                <p className={`text-fg-neutral-muted ${userNameSize}`}>
                  차단한 사용자
                </p>
              </>
            ) : (
              <>
                <ProfileImage
                  profileImgSrc={userInfo.userProfileImage}
                  size={userImageSize}
                />
                <p className={`text-fg-neutral-muted ${userNameSize}`}>
                  {truncStr(userInfo.nickName, 12)}
                </p>
              </>
            )}
          </div>
        </Link>
        <div className="flex items-center space-x-1">
          {isBestReview && (
            <Label
              name={LABEL_NAMES.BEST}
              icon={
                <SemanticIcon
                  src="/icon/thumbup-filled-white.svg"
                  width={12}
                  height={12}
                />
              }
              styleClass={`${isBlocked ? 'border-stroke-neutral-subtle bg-bg-disabled text-fg-disabled' : 'border-stroke-brand-solid bg-bg-brand-solid text-fg-brand-contrast'} rounded px-2 py-[3px] text-10`}
            />
          )}
          {isMyReview && (
            <Label
              name={LABEL_NAMES.MY_REVIEW}
              icon={
                <SemanticIcon
                  src="/icon/user-outlined-subcoral.svg"
                  width={12}
                  height={12}
                />
              }
              styleClass="rounded border-stroke-brand-solid bg-bg-transparent px-2 py-[3px] text-10 text-fg-brand"
            />
          )}
        </div>
      </div>
      {rating !== undefined && rating !== null && !isBlocked && (
        <Star rating={rating} size={starSize} textStyle={starTextStyle} />
      )}
    </div>
  );
}

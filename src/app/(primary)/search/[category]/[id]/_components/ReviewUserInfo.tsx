import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Label from '@/app/(primary)/_components/Label';
import { truncStr } from '@/utils/truncStr';
import Star from '@/components/Star';
import { ROUTES } from '@/constants/routes';

const DEFAULT_USER_IMAGE = '/profile-default.svg';

interface ReviewUserInfoProps {
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

export default function ReviewUserInfo({
  userInfo,
  rating,
  isBestReview,
  isMyReview,
  userImageSize = 22,
  userNameSize = 'text-12',
  starSize = 22,
  starTextStyle = 'text-subCoral font-semibold text-20 min-w-5',
  className = '',
}: ReviewUserInfoProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center space-x-2">
        <Link href={ROUTES.USER.BASE(userInfo.userId)}>
          <div className="flex items-center space-x-1">
            <div
              className="rounded-full overflow-hidden"
              style={{ width: userImageSize, height: userImageSize }}
            >
              <Image
                className="object-cover"
                src={userInfo.userProfileImage || DEFAULT_USER_IMAGE}
                alt="user_img"
                width={userImageSize}
                height={userImageSize}
              />
            </div>
            <p className={`text-mainGray ${userNameSize}`}>
              {truncStr(userInfo.nickName, 12)}
            </p>
          </div>
        </Link>
        <div className="flex items-center space-x-1">
          {isBestReview && (
            <Label
              name="베스트"
              icon="/icon/thumbup-filled-white.svg"
              iconHeight={12}
              iconWidth={12}
              styleClass="bg-mainCoral text-white px-2 py-[3px] text-10 border-mainCoral rounded"
            />
          )}
          {isMyReview && (
            <Label
              name="나의 코멘트"
              icon="/icon/user-outlined-subcoral.svg"
              iconHeight={12}
              iconWidth={12}
              styleClass="border-mainCoral text-mainCoral px-2 py-[3px] text-10 rounded"
            />
          )}
        </div>
      </div>
      {rating !== undefined && rating !== null && (
        <Star rating={rating} size={starSize} textStyle={starTextStyle} />
      )}
    </div>
  );
}

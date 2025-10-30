import React from 'react';
import Link from 'next/link';
import Label from '@/components/ui/Display/Label';
import ProfileImage from '@/components/domain/user/ProfileImage';
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
  starTextStyle = 'text-subCoral font-semibold text-20 min-w-5',
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
                <div className="rounded-full w-[22px] h-[22px] bg-brightGray" />

                <p className={`text-mainGray ${userNameSize}`}>차단한 사용자</p>
              </>
            ) : (
              <>
                <ProfileImage
                  profileImgSrc={userInfo.userProfileImage}
                  size={userImageSize}
                />
                <p className={`text-mainGray ${userNameSize}`}>
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
              icon="/icon/thumbup-filled-white.svg"
              iconHeight={12}
              iconWidth={12}
              styleClass={`${isBlocked ? 'bg-brightGray border-brightGray' : 'bg-mainCoral border-mainCoral'} text-white px-2 py-[3px] text-10 rounded`}
            />
          )}
          {isMyReview && (
            <Label
              name={LABEL_NAMES.MY_REVIEW}
              icon="/icon/user-outlined-subcoral.svg"
              iconHeight={12}
              iconWidth={12}
              styleClass="border-mainCoral text-mainCoral px-2 py-[3px] text-10 rounded"
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

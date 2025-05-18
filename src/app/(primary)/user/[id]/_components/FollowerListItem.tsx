import Image from 'next/image';
import Link from 'next/link';
import { RelationInfo } from '@/types/User';
import { FollowButton } from './FollowButton';
import DefaultProfile from 'public/profile-default.svg';
import CommentGray from 'public/icon/comment-filled-gray.svg';
import StarGray from 'public/icon/star-filled-gray.svg';
import { ROUTES } from '@/constants/routes';

interface Props {
  userInfo: RelationInfo;
}

export const FollowerListItem = ({ userInfo }: Props) => {
  return (
    <article
      key={userInfo.followUserId}
      className="border-b border-brightGray py-3 flex justify-around"
    >
      <Link
        className="grid grid-cols-[0.45fr_1fr]"
        href={ROUTES.USER.BASE(userInfo.userId)}
      >
        <div className="w-9 h-9 rounded-full overflow-hidden">
          <Image
            src={userInfo.userProfileImage ?? DefaultProfile}
            width={36}
            height={36}
            alt="유저 프로필"
            className="object-cover w-full h-full"
          />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-12 font-bold">{userInfo.followUserNickname}</p>
          <p className="text-10 text-brightGray font-semibold flex gap-2">
            <span className="flex gap-1">
              <Image src={CommentGray} alt="리뷰" width={12} height={12} />
              {`리뷰 ${userInfo.reviewCount}개`}
            </span>
            <span>|</span>
            <span className="flex gap-1">
              <Image src={StarGray} alt="평가" width={13} height={13} />
              {`평가 ${userInfo.ratingCount}개`}
            </span>
          </p>
        </div>
      </Link>

      <div className="ml-auto flex items-center">
        <FollowButton
          isFollowing={userInfo.status === 'FOLLOWING'}
          followUserId={userInfo.userId}
        />
      </div>
    </article>
  );
};

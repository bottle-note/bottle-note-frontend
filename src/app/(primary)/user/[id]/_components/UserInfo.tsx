'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button/Button';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import { ROUTES } from '@/constants/routes';
import ProfileImage from '@/components/domain/user/ProfileImage';
import { FollowButton } from './FollowButton';

interface Props {
  profileImgSrc: string | null;
  follower: number;
  following: number;
  currentId: string;
  isFollowing?: boolean;
  nickName: string;
}

const UserInfo = ({
  profileImgSrc = null,
  follower,
  following,
  isFollowing,
  currentId,
  nickName,
}: Props) => {
  const { user: userData } = useAuthSession();
  const [isMyProfile, setIsMyProfile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMyProfile(userData?.userId === Number(currentId));
  }, []);

  return (
    <section className="flex space-x-[21.008px] py-28">
      <ProfileImage profileImgSrc={profileImgSrc} borderWidth="bold" />

      <article className="py-13.5 space-y-12">
        <div className="space-y-4">
          <h1 className="text-20 font-extrabold text-fg-brand">{nickName}</h1>

          <div className="flex gap-8">
            <button
              onClick={() =>
                router.push(ROUTES.USER.FOLLOW(currentId, 'follower'))
              }
            >
              <p className="text-13">
                <strong className="font-bold">팔로워 </strong>
                <span>{follower}</span>
              </p>
            </button>

            <button
              onClick={() =>
                router.push(ROUTES.USER.FOLLOW(currentId, 'following'))
              }
            >
              <p className="text-13">
                <strong className="font-bold">팔로잉 </strong>
                <span>{following}</span>
              </p>
            </button>
          </div>
        </div>

        <div className="space-x-4 text-sm">
          {isMyProfile && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => router.push(ROUTES.USER.EDIT(currentId))}
            >
              프로필 수정
            </Button>
          )}

          {!isMyProfile && (
            <FollowButton
              isFollowing={Boolean(isFollowing)}
              followUserId={Number(currentId)}
            />
          )}
        </div>
      </article>
    </section>
  );
};

export default UserInfo;

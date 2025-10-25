'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
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
  const { user: userData } = useAuth();
  const [isMyProfile, setIsMyProfile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMyProfile(userData?.userId === Number(currentId));
  }, []);

  return (
    <section className="flex space-x-5.25 py-7">
      <ProfileImage profileImgSrc={profileImgSrc} borderWidth="bold" />

      <article className="py-[13.5px] space-y-3">
        <div className="space-y-1">
          <h1 className="text-20 font-extrabold text-subCoral">{nickName}</h1>

          <div className="flex gap-2">
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

        <div className="space-x-1 text-sm">
          {isMyProfile && (
            <button
              className="border border-subCoral px-2.5 py-1 rounded-md text-10 bg-white text-subCoral"
              onClick={() => router.push(ROUTES.USER.EDIT(currentId))}
            >
              프로필 수정
            </button>
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

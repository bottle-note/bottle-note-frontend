'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/AuthService';
import ProfileImage from './ProfileImage';
import { FollowButton } from './FollowButton';
import { ROUTES } from '@/constants/routes';

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
  const { userData } = AuthService;
  const [isMyProfile, setIsMyProfile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMyProfile(userData?.userId === Number(currentId));
  }, []);

  return (
    <section className="flex space-x-5.25 py-8.75 border-b border-t border-subCoral">
      <ProfileImage profileImgSrc={profileImgSrc} />

      <article className="space-y-2.5">
        <h1 className="text-3xl font-bold text-subCoral">{nickName}</h1>

        <div className="flex gap-2">
          <button
            onClick={() =>
              router.push(ROUTES.USER.FOLLOW(currentId, 'follower'))
            }
          >
            <p className="text-sm font-thin">
              <strong className="font-black">팔로워 </strong>
              <span>{follower}</span>
            </p>
          </button>

          <button
            onClick={() =>
              router.push(ROUTES.USER.FOLLOW(currentId, 'following'))
            }
          >
            <p className="text-sm">
              <strong className="font-black">팔로잉 </strong>
              <span>{following}</span>
            </p>
          </button>
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

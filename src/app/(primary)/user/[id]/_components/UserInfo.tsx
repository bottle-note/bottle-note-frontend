'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/AuthService';
import ProfileImage from './ProfileImage';
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
  const { userData } = AuthService;
  const [isMatchUser, setIsMatchUser] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMatchUser(userData?.userId === Number(currentId));
  }, []);

  return (
    <section className="flex space-x-5.25 py-8.75 border-b border-t border-subCoral">
      <ProfileImage profileImgSrc={profileImgSrc} />

      <article className="space-y-2.5">
        <h1 className="text-3xl font-bold text-subCoral">{nickName}</h1>

        <div className="flex gap-2">
          <button
            onClick={() =>
              router.push(`/user/${currentId}/follow?type=following`)
            }
          >
            <p className="text-sm">
              <strong>팔로워 </strong>
              <span>{follower}</span>
            </p>
          </button>

          <button
            onClick={() =>
              router.push(`/user/${currentId}/follow?type=follower`)
            }
          >
            <p className="text-sm">
              <strong>팔로잉 </strong>
              <span>{following}</span>
            </p>
          </button>
        </div>

        <div className="space-x-1 text-sm">
          {isMatchUser && (
            <button
              className="border border-subCoral px-2.5 py-1 rounded-md text-10 bg-white text-subCoral"
              onClick={() => router.push(`/user/${currentId}/edit`)}
            >
              프로필 수정
            </button>
          )}

          {!isMatchUser && <FollowButton isFollowing={Boolean(isFollowing)} />}
        </div>
      </article>
    </section>
  );
};

export default UserInfo;

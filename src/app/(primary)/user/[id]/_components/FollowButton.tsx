import { useState } from 'react';
import { UserApi } from '@/app/api/UserApi';
import { RelationInfo } from '@/types/User';

interface Props {
  isFollowing: boolean;
  followUserId: number;
}

export const FollowButton = ({ isFollowing, followUserId }: Props) => {
  const [followingStatus, setFollowingStatus] = useState(isFollowing);

  function reverseFollowingStatus(
    status: RelationInfo['status'],
  ): RelationInfo['status'] {
    return status === 'FOLLOWING' ? 'UNFOLLOW' : 'FOLLOWING';
  }

  async function handleOnFollow() {
    try {
      const status = followingStatus ? 'FOLLOWING' : 'UNFOLLOW';
      await UserApi.updateFollowingStatus({
        followUserId,
        status: reverseFollowingStatus(status),
      });
      setFollowingStatus((prev) => !prev);
    } catch (e) {
      throw new Error((e as Error).message);
    }
  }

  if (followingStatus)
    return (
      <button
        className="px-2.5 py-1 text-10 label-selected"
        onClick={handleOnFollow}
      >
        팔로잉
      </button>
    );

  return (
    <button
      className="px-2.5 py-1 text-10 label-default"
      onClick={handleOnFollow}
    >
      팔로우
    </button>
  );
};

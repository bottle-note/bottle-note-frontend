import { useState } from 'react';
import { FollowApi } from '@/api/follow/follow.api';
import { RelationInfo } from '@/api/follow/types';
import { trackGA4Event } from '@/utils/analytics/ga4';

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
      const newStatus = reverseFollowingStatus(status);
      await FollowApi.updateFollowingStatus({
        followUserId,
        status: newStatus,
      });
      trackGA4Event('follow_user', {
        follow_user_id: followUserId,
        action: newStatus === 'FOLLOWING' ? 'follow' : 'unfollow',
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

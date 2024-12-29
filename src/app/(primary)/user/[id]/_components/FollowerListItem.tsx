import { RelationInfo } from '@/types/User';

interface Props {
  userInfo: RelationInfo;
}

export const FollowerListItem = ({ userInfo }: Props) => {
  return (
    <div
      key={userInfo.followUserId}
      className="border-b border-brightGray py-3"
    >
      {userInfo.nickName}
    </div>
  );
};

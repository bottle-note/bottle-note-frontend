import Link from 'next/link';
import ProfileImage from '@/components/domain/user/ProfileImage';
import { ROUTES } from '@/constants/routes';
import { ThemeColor } from '@/style/theme';

export interface UserImageProps {
  imgSrc: string | null;
  size?: number;
}

export const UserImage = ({ imgSrc, size = 30 }: UserImageProps) => {
  return <ProfileImage profileImgSrc={imgSrc} size={size} />;
};

export interface UserNickNameProps {
  nickName: string;
  size?: number;
  color?: ThemeColor;
}

export const UserNickName = ({
  nickName,
  size = 13,
  color = 'mainGray',
}: UserNickNameProps) => {
  const textColorClass = `text-${color}`;

  return (
    <p style={{ fontSize: `${size}px` }} className={`${textColorClass}`}>
      {nickName}
    </p>
  );
};

export interface UserInfoDisplayProps {
  userImageProps: UserImageProps;
  userNickNameProps: Omit<UserNickNameProps, 'nickName'>;
  nickName: string;
  userId: string | number;
  className?: string;
}

export const UserInfoDisplay = ({
  userImageProps,
  userNickNameProps,
  nickName,
  userId,
  className = 'flex items-center space-x-[7px]',
}: UserInfoDisplayProps) => {
  return (
    <Link href={ROUTES.USER.BASE(userId)}>
      <div className={className}>
        <UserImage {...userImageProps} />
        <UserNickName {...userNickNameProps} nickName={nickName} />
      </div>
    </Link>
  );
};

export default UserInfoDisplay;

import Image from 'next/image';
import Link from 'next/link';
import { number } from 'yup';
import { ROUTES } from '@/constants/routes';
import { ThemeColor } from '@/style/theme';
import ProfileDefaultImg from 'public/profile-default.svg';

export interface UserImageProps {
  imgSrc: string | null;
  width?: number;
  height?: number;
  alt?: string;
}

export const UserImage = ({
  imgSrc,
  width = 30,
  height = 30,
  alt = 'user_img',
}: UserImageProps) => {
  return (
    <div
      style={{ width: `${width}px`, height: `${height}px` }}
      className="rounded-full overflow-hidden shrink-0"
    >
      <Image
        className="object-cover w-full h-full"
        src={imgSrc ?? ProfileDefaultImg}
        alt={alt}
        width={width}
        height={height}
      />
    </div>
  );
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

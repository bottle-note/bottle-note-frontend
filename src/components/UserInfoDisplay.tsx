import { ThemeColor } from '@/style/theme';
import Image from 'next/image';
import ProfileDefaultImg from 'public/profile-default.svg';
import { number } from 'yup';

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
  const widthClass = `w-[${width}px]`;
  const heightClass = `h-[${height}px]`;

  return (
    <div
      className={`${widthClass} ${heightClass} rounded-full overflow-hidden shrink-0`}
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
  const textSizeClass = `text-[${size}px]`;
  const textColorClass = `text-${color}`;

  return <p className={`${textColorClass} ${textSizeClass}`}>{nickName}</p>;
};

export interface UserInfoDisplayProps {
  userImageProps: UserImageProps;
  userNickNameProps: Omit<UserNickNameProps, 'nickName'>;
  nickName: string;
  className?: string;
}

export const UserInfoDisplay = ({
  userImageProps,
  userNickNameProps,
  nickName,
  className = 'flex items-center space-x-[7px]',
}: UserInfoDisplayProps) => {
  return (
    <div className={className}>
      <UserImage {...userImageProps} />
      <UserNickName {...userNickNameProps} nickName={nickName} />
    </div>
  );
};

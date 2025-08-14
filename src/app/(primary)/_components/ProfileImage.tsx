import Image from 'next/image';
import ProfileDefaultImg from 'public/profile-default.svg';

interface Props {
  profileImgSrc?: string | null;
  size?: number;
  showBorder?: boolean;
}

function ProfileImage({ profileImgSrc, size = 104, showBorder = true }: Props) {
  const borderClass = showBorder ? 'border-2 border-subCoral' : '';

  return (
    <div
      className="relative"
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <Image
        src={profileImgSrc ?? ProfileDefaultImg}
        alt="프로필 이미지"
        fill
        className={`rounded-full ${borderClass} object-cover`}
        priority
      />
    </div>
  );
}

export default ProfileImage;

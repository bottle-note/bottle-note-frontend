import Image from 'next/image';
import ProfileDefaultImg from 'public/profile-default.svg';

interface Props {
  profileImgSrc?: string | null;
  size?: number;
  borderWidth?: 'thin' | 'bold';
  opacity?: number;
}

function ProfileImage({
  profileImgSrc,
  size = 104,
  borderWidth = 'thin',
  opacity = 1,
}: Props) {
  const borderClass = borderWidth === 'bold' ? 'border-2 border-subCoral' : '';
  const opacityClass = !profileImgSrc && opacity < 1 ? 'opacity-50' : '';

  return (
    <div
      className="relative"
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <Image
        src={profileImgSrc ?? ProfileDefaultImg}
        alt="프로필 이미지"
        fill
        sizes={`${size}px`}
        className={`rounded-full ${borderClass} ${opacityClass} object-cover`}
      />
    </div>
  );
}

export default ProfileImage;

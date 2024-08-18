import Image from 'next/image';
import ProfileDefaultImg from 'public/profile-default.svg';

interface Props {
  profileImgSrc: string | null;
}

function ProfileImage({ profileImgSrc }: Props) {
  return (
    <Image
      src={profileImgSrc ?? ProfileDefaultImg}
      alt="프로필 이미지"
      width={104}
      height={104}
      className="rounded-full border-2 border-subCoral"
    />
  );
}

export default ProfileImage;

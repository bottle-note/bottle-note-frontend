import Image from 'next/image';
import ProfileDefaultImg from 'public/profile-default.svg';

interface Props {
  profileImgSrc: string | null;
}

function ProfileImage({ profileImgSrc }: Props) {
  return (
    <div className="w-[104px] h-[104px] relative">
      <Image
        src={profileImgSrc ?? ProfileDefaultImg}
        alt="프로필 이미지"
        fill
        className="rounded-full border-2 border-subCoral object-cover"
      />
    </div>
  );
}

export default ProfileImage;

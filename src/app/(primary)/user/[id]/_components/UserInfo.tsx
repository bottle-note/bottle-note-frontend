import Image from 'next/image';
import ProfileDefaultImg from 'public/profile-default.svg';

// TODO: api dto 에 맞출것
interface Props {
  profileImgSrc: string | null;
  follower: number;
  following: number;
  isFollowing?: boolean; // NOTE: 내가 following 중인 상태,
}

// TODO: 버튼 스타일 공통화
const UserInfo = ({
  profileImgSrc = null,
  follower,
  following,
  isFollowing,
}: Props) => {
  const buttonConfig = [
    {
      type: 'follow',
      text: isFollowing ? '팔로잉' : '팔로우',
      style: isFollowing ? 'bg-subCoral text-white' : 'bg-white text-subCoral',
    },
    {
      type: 'profile',
      text: '프로필 수정',
      style: 'bg-white text-subCoral',
    },
    {
      type: 'share',
      text: '공유',
      style: 'bg-white text-subCoral',
    },
  ];

  return (
    <section className="flex space-x-5.25 py-8.75 border-b border-t border-subCoral">
      <Image
        src={profileImgSrc ?? ProfileDefaultImg}
        alt="프로필 이미지"
        width={104}
        height={104}
      />

      <article className="space-y-2.5">
        <h1 className="text-3xl font-bold text-subCoral">서울시보틀짱</h1>
        <div className="flex gap-2">
          <p className="text-sm">
            <strong>팔로워 </strong>
            <span>{follower}</span>
          </p>
          <p className="text-sm">
            <strong>팔로잉 </strong>
            <span>{following}</span>
          </p>
        </div>

        <div className="space-x-1 text-sm">
          {buttonConfig.map(({ type, text, style }) => (
            <button
              key={type}
              className={`border border-subCoral px-2.5 py-1 rounded-md text-xxs ${style}`}
            >
              {text}
            </button>
          ))}
        </div>
      </article>
    </section>
  );
};

export default UserInfo;

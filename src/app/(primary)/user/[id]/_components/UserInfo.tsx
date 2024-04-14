import Image from 'next/image';
import ProfileDefaultImg from 'public/profile-default.svg';

const UserInfo = () => {
  return (
    <section className="flex space-x-5.25 py-8.75 border-b border-t border-subCoral">
      <Image src={ProfileDefaultImg} alt="프로필 이미지" />

      <article className="space-y-2.5">
        <h1 className="text-3xl font-bold">김보틀</h1>
        <div className="flex flex-col">
          <p className="text-sm">
            <strong>FOLLOWER </strong>
            <span>323</span>
          </p>
          <p className="text-sm">
            <strong>FOLLOWING </strong>
            <span>12</span>
          </p>
        </div>

        <div className="space-x-1 text-sm">
          <button className="bg-subCoral px-2.5 py-1 rounded-md text-white">
            팔로잉
          </button>
          <button className="bg-white border border-subCoral px-2.5 py-1 rounded-md text-subCoral">
            프로필 수정
          </button>
          <button className="bg-white border border-subCoral px-2.5 py-1 rounded-md text-subCoral">
            공유
          </button>
        </div>
      </article>
    </section>
  );
};

export default UserInfo;

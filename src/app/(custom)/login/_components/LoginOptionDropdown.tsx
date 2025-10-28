import { signIn } from 'next-auth/react';
import BackDrop from '@/components/ui/Modal/BackDrop';
import SocialLoginBtn from './SocialLoginBtn';

interface Props {
  handleClose: () => void;
}

function LoginOptionDropdown({ handleClose }: Props) {
  return (
    <BackDrop isShow>
      <section className="w-full h-full flex flex-col justify-end items-center px-4 gap-3 pb-2">
        <article className="w-full bg-white rounded-xl divide-y max-h-[400px] overflow-y-scroll">
          <div className="py-4 text-center text-mainGray text-sm">
            다른 소셜 계정으로 로그인
          </div>
          <div className="flex flex-col items-center justify-center gap-2 p-5">
            <SocialLoginBtn type="NAVER" onClick={() => signIn('naver')} />
            <SocialLoginBtn type="GOOGLE" onClick={() => signIn('google')} />
          </div>
        </article>
        <button
          className="w-full bg-white rounded-xl py-4"
          onClick={handleClose}
        >
          닫기
        </button>
      </section>
    </BackDrop>
  );
}

export default LoginOptionDropdown;

import Image from 'next/image';
import KakaoLogo from 'public/icon/kakao-logo.svg';
import AppleLogo from 'public/icon/apple-logo.svg';

type LoginType = 'KAKAO' | 'APPLE';
interface Props {
  type: LoginType;
  onClick: () => void;
}

function SocialLoginBtn({ type, onClick }: Props) {
  const getStyle = (loginType: LoginType) => {
    switch (loginType) {
      case 'KAKAO':
        return 'bg-[#FEE500] text-black text-opacity-85';
      case 'APPLE':
        return 'bg-black text-white';
      default:
    }
  };

  return (
    <button
      onClick={onClick}
      className={`w-full rounded-md py-10 ${getStyle(type)}`}
    >
      {type === 'KAKAO' && (
        <div className="flex justify-center relative">
          <Image
            src={KakaoLogo}
            alt="kakao-logo"
            className="absolute top-1/2 -translate-y-1/2 left-16 w-20"
          />
          <span>카카오 로그인</span>
        </div>
      )}
      {type === 'APPLE' && (
        <div className="flex justify-center relative">
          <Image
            src={AppleLogo}
            alt="apple-logo"
            className="absolute top-1/2 -translate-y-1/2 left-16 w-16"
          />
          <span>Apple로 로그인</span>
        </div>
      )}
    </button>
  );
}

export default SocialLoginBtn;

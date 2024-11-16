type LoginType = 'KAKAO' | 'APPLE' | 'GOOGLE' | 'NAVER';
interface Props {
  type: LoginType;
  onClick: () => void;
}

function SocialLoginBtn({ type, onClick }: Props) {
  const getStyle = (loginType: LoginType) => {
    switch (loginType) {
      case 'KAKAO':
        return 'bg-[#FEE500] text-black';
      case 'APPLE':
        return 'bg-black text-white';
      default:
    }
  };

  return (
    <button
      onClick={onClick}
      className={`w-full rounded-md py-2.5 ${getStyle(type)}`}
    >
      {type === 'KAKAO' && <span>카카오 로그인</span>}
      {type === 'APPLE' && <span>Apple로 로그인</span>}
    </button>
  );
}

export default SocialLoginBtn;

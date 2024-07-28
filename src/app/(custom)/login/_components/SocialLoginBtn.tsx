import Image from 'next/image';
import KakaoBtn from 'public/login/loginButton_kakao.svg';
import AppleBtn from 'public/login/loginButton_apple.svg';
import NaverBtn from 'public/login/loginButton_Naver.svg';
import GoogleBtn from 'public/login/loginButton_google.svg';

interface Props {
  type: 'KAKAO' | 'APPLE' | 'GOOGLE' | 'NAVER';
  onClick: () => void;
}

function SocialLoginBtn({ type, onClick }: Props) {
  return (
    <button onClick={onClick}>
      {type === 'KAKAO' && <Image src={KakaoBtn} alt="카카오로 로그인" />}
      {type === 'APPLE' && <Image src={AppleBtn} alt="애플로 로그인" />}
      {type === 'NAVER' && <Image src={NaverBtn} alt="네이버로 로그인" />}
      {type === 'GOOGLE' && <Image src={GoogleBtn} alt="구글로 로그인" />}
    </button>
  );
}

export default SocialLoginBtn;

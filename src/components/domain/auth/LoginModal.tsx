'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import PromptModal from '@/components/ui/Modal/PromptModal';
import { setReturnToUrl } from '@/utils/loginRedirect';

interface Props {
  handleClose: () => void;
  returnTo?: string;
}

function LoginModal({ handleClose, returnTo }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleLoginClick = () => {
    const queryString = searchParams.toString();
    const currentUrl = `${pathname}${queryString ? `?${queryString}` : ''}`;

    handleClose();
    setReturnToUrl(returnTo ?? currentUrl);
    router.push(ROUTES.LOGIN);
  };

  return (
    <PromptModal
      mainText="로그인이 필요한 서비스입니다."
      subText="로그인 하시겠습니까?"
      actionText="로그인"
      onAction={handleLoginClick}
      onClose={handleClose}
    />
  );
}

export default LoginModal;

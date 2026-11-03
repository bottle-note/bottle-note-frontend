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
      // 어떤 동작에서 떴는지 모르고, 세션이 만료된 사용자에게도 뜨므로 어느 경우에도 맞는 말로 둔다
      mainText="로그인하고 이어서 할까요?"
      subText="간편 로그인으로 3초면 시작할 수 있어요."
      actionText="로그인하기"
      onAction={handleLoginClick}
      onClose={handleClose}
    />
  );
}

export default LoginModal;

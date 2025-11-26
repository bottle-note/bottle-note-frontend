'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import useModalStore from '@/store/modalStore';
import { ROUTES } from '@/constants/routes';

export const useNavigateReviewWrite = () => {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { handleLoginModal } = useModalStore();

  const handleReviewWrite = (alcoholId: string | number) => {
    if (!isLoggedIn || !alcoholId) {
      handleLoginModal();
      return;
    }
    router.push(ROUTES.REVIEW.REGISTER(String(alcoholId)));
  };

  return {
    handleReviewWrite,
    isLoggedIn,
  };
};

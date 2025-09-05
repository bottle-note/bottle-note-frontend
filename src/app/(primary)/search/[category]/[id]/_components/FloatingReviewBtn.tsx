'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/auth/useAuth';
import useModalStore from '@/store/modalStore';
import { ROUTES } from '@/constants/routes';
import { useScrollState } from '@/hooks/useScrollState';

const FloatingReviewBtn = ({ alcoholId }: { alcoholId: string }) => {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { handleLoginModal } = useModalStore();
  const { isAtTop, isVisible } = useScrollState();

  const handleClick = () => {
    if (!isLoggedIn || !alcoholId) {
      handleLoginModal();
      return;
    }
    router.push(ROUTES.REVIEW.REGISTER(alcoholId));
  };

  const getPositionClass = () => {
    const basePosition = isVisible ? 'bottom-[115px]' : 'bottom-[14px]';
    const sizeClass = isAtTop ? 'px-4 py-[13px]' : 'w-12 h-12';
    return `${basePosition} right-4 ${sizeClass}`;
  };

  return (
    <button
      onClick={handleClick}
      className={`fixed z-20 transition-all duration-300 ease-in-out bg-subCoral text-white rounded-full shadow-lg hover:shadow-xl ${getPositionClass()}`}
    >
      {isAtTop ? (
        <div className="flex items-center space-x-3">
          <Image
            src="/icon/plus-white.svg"
            alt="write"
            width={17}
            height={17}
          />
          <p className="text-16 font-bold whitespace-nowrap">리뷰작성</p>
        </div>
      ) : (
        <div className="flex items-center justify-center w-full h-full">
          <Image
            src="/icon/plus-white.svg"
            alt="write"
            width={17}
            height={17}
          />
        </div>
      )}
    </button>
  );
};

export default FloatingReviewBtn;

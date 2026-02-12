'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { useScrollState } from '@/hooks/useScrollState';
import { useAuth } from '@/hooks/auth/useAuth';
import useModalStore from '@/store/modalStore';

interface Props {
  alcoholId: string;
}

export default function FloatingTastingButton({ alcoholId }: Props) {
  const router = useRouter();
  const { isAtTop, isVisible } = useScrollState();
  const { isLoggedIn } = useAuth();
  const { handleLoginModal } = useModalStore();

  const handleClick = () => {
    if (!isLoggedIn) {
      handleLoginModal();
      return;
    }
    router.push(`/tasting-note/${alcoholId}`);
  };

  const getPositionClass = () => {
    const basePosition = isVisible ? 'bottom-[175px]' : 'bottom-[74px]';
    return `${basePosition} right-[max(16px,calc((100vw-468px)/2+16px))]`;
  };

  return (
    <button
      onClick={handleClick}
      className={`fixed z-20 transition-all duration-300 ease-in-out bg-white border-2 border-subCoral text-subCoral rounded-full shadow-lg hover:shadow-xl ${getPositionClass()}`}
      style={{
        width: isAtTop ? 'auto' : '52px',
        height: '52px',
        paddingLeft: isAtTop ? '16px' : '0px',
        paddingRight: isAtTop ? '16px' : '0px',
      }}
    >
      <div className="flex items-center justify-center h-full">
        <Image
          src="/icon/chart-subcoral.svg"
          alt="tasting"
          width={20}
          height={20}
          className="flex-shrink-0"
        />
        <div
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            width: isAtTop ? 'auto' : '0px',
            opacity: isAtTop ? 1 : 0,
            marginLeft: isAtTop ? '12px' : '0px',
          }}
        >
          <p className="text-14 font-bold whitespace-nowrap">테이스팅</p>
        </div>
      </div>
    </button>
  );
}

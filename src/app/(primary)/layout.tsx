'use client';

import useModalStore from '@/store/modalStore';
import LoginModal from './_components/LoginModal';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { loginState, handleLoginModal } = useModalStore();

  return (
    <main className="bg-white flex flex-col w-full mx-auto max-w-[430px] min-h-screen">
      <section className="flex-1 overflow-y-auto">{children}</section>
      {loginState.isShowLoginModal && (
        <LoginModal handleClose={handleLoginModal} />
      )}
    </main>
  );
}

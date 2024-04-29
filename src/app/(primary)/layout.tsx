'use client';

import Navbar from '@/components/Navbar';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-white flex flex-col w-full mx-auto max-w-[430px] min-h-screen">
      <main className="flex-1 overflow-y-auto">
        {children}
        <Navbar maxWidth="430px" />
      </main>
    </div>
  );
}

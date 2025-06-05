import NavLayout from '../_components/NavLayout';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NavLayout showNavbar>
      <main className="mb-24 w-full h-full min-h-screen relative bg-gray-50">
        {children}
      </main>
    </NavLayout>
  );
}

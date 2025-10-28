import NavLayout from '@/components/ui/Layout/NavLayout';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <NavLayout showNavbar>{children}</NavLayout>;
}

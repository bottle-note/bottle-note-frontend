import NavLayout from '../_components/NavLayout';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <NavLayout showNavbar>{children}</NavLayout>;
}

/* eslint-disable jsx-a11y/click-events-have-key-events */

import NavLayout from '../_components/NavLayout';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <NavLayout>{children}</NavLayout>;
}

/* eslint-disable jsx-a11y/click-events-have-key-events */

import NavLayout from '../_components/NavLayout';
import SearchContainer from './_components/SearchContainer';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NavLayout>
      <main className="mb-24 w-full h-full">
        <SearchContainer />

        <section className="p-5 space-y-7">{children}</section>
      </main>
    </NavLayout>
  );
}

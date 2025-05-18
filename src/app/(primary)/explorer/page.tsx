import { Suspense } from 'react';
import Header from '../_components/Header';

export default function ExplorerPage() {
  return (
    <Suspense>
      <main className="mb-24 w-full h-full relative">
        <Header />
      </main>
    </Suspense>
  );
}

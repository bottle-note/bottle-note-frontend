import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '오류',
  robots: { index: false, follow: false },
};

export default function Error() {
  return <div>Error page</div>;
}

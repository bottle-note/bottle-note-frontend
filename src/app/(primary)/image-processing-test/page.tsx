import type { Metadata } from 'next';
import ImageProcessingTest from './_components/ImageProcessingTest';

export const metadata: Metadata = {
  title: '이미지 전처리 테스트',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ImageProcessingTestPage() {
  return <ImageProcessingTest />;
}

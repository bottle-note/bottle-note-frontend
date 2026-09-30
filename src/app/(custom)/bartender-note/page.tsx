import type { Metadata } from 'next';
import BartenderExperience from './_components/BartenderExperience';

export const metadata: Metadata = {
  title: '바텐더 노트',
  description: '바텐더 노트와 함께 위스키를 고르고 한 잔의 기록을 남겨 보세요.',
  robots: { index: false, follow: false },
};

export default function BartenderNotePage() {
  return <BartenderExperience />;
}

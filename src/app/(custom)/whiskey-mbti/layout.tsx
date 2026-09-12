import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WHISKY MBTI: 나를 닮은 한 잔',
  description:
    '술자리 성향과 맛 취향으로 나와 어울리는 위스키 한 잔을 찾아보세요.',
};

export default function WhiskeyMbtiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

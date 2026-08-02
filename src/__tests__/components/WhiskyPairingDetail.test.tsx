import { render, screen } from '@testing-library/react';
import type { WhiskyPairingDetailItem } from '@/api/curation-v2/types';
import { WhiskyPairingDetail } from '@/app/(primary)/curation/[id]/_components/WhiskyPairingDetail';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ back: jest.fn() }),
}));

class ResizeObserverMock {
  observe() {}

  unobserve() {}

  disconnect() {}
}

global.ResizeObserver = ResizeObserverMock;

const pairing: WhiskyPairingDetailItem = {
  id: 18,
  name: '위스키와 잘 어울리는 디저트',
  description: '무더운 여름 위스키와 잘 어울리는 디저트를 소개합니다.',
  coverImageUrl: 'https://example.com/cover.jpg',
  imageUrls: [],
  exposureStartDate: '2026-07-01',
  exposureEndDate: '2026-08-01',
  displayOrder: 1,
  createAt: '2026-07-01',
  spec: {
    id: 2,
    code: 'WHISKY_PAIRING',
    name: '위스키 페어링',
    container: 'array',
    responseSpec: {},
  },
  payload: [
    {
      source: 'BOTTLE_NOTE',
      alcohol: {
        alcoholId: 6415,
        korName: 'TSC 2013 글렌오드 8년',
      },
      pairings: [
        {
          itemName: '솔티드 초콜릿',
          pairingNote: '짠맛이 위스키의 단맛을 살려줘요.',
          itemImageUrl: 'https://example.com/chocolate.jpg',
        },
        {
          itemName: '바닐라 아이스크림',
          pairingNote: '부드러운 질감이 위스키의 여운과 이어져요.',
        },
      ],
    },
  ],
};

describe('WhiskyPairingDetail', () => {
  it('Figma의 페어링 라인업 구조로 음식과 설명을 렌더링한다', () => {
    render(<WhiskyPairingDetail pairing={pairing} />);

    expect(screen.getByText('페어링 2종 추천')).toBeInTheDocument();
    expect(screen.getByText('페어링 라인업')).toBeInTheDocument();
    expect(screen.getByText('TSC 2013 글렌오드 8년')).toBeInTheDocument();
    expect(screen.getByText('솔티드 초콜릿')).toBeInTheDocument();
    expect(
      screen.getByText('짠맛이 위스키의 단맛을 살려줘요.'),
    ).toBeInTheDocument();
    expect(screen.getByText('바닐라 아이스크림')).toBeInTheDocument();

    expect(screen.getByText('페어링 1')).toHaveClass(
      'bg-bg-brand-weak',
      'text-fg-brand',
    );
  });
});

import { render, screen } from '@testing-library/react';
import type { TastingEventPayload } from '@/api/curation-v2/types';
import { TastingEventInfoCard } from '@/app/(primary)/curation/_components/TastingEventInfoCard';

const payload: TastingEventPayload = {
  capacity: 20,
  entryFee: 50000,
  eventDate: '2026-07-20',
  eventTime: '19:00',
  guideText: '행사 안내',
  barAddress: '서울 송파구 송파대로 145',
  detailAddress: '2층 보틀노트 테이스팅룸',
  isRecruiting: true,
  applicationLink: 'https://example.com',
};

describe('TastingEventInfoCard 장소 정보', () => {
  it('목록 카드에서 지번주소와 detailAddress를 함께 렌더링한다', () => {
    render(<TastingEventInfoCard payload={payload} />);

    const address = screen.getByText(
      '서울 송파구 송파대로 145 2층 보틀노트 테이스팅룸',
    );

    expect(address).toBeInTheDocument();
    expect(address).toHaveClass('line-clamp-2');
    expect(address).not.toHaveClass('truncate');
  });

  it('상세 카드에서는 전체 주소를 줄바꿈으로 렌더링한다', () => {
    render(<TastingEventInfoCard payload={payload} textBehavior="wrap" />);

    const address = screen.getByText(
      '서울 송파구 송파대로 145 2층 보틀노트 테이스팅룸',
    );

    expect(address).toHaveClass('whitespace-normal', 'break-words', 'text-13');
    expect(address).not.toHaveClass('line-clamp-2', 'truncate');
  });
});

describe('TastingEventInfoCard 모집 인원 정보', () => {
  it('모집 인원이 0명이면 모집 인원 미정으로 렌더링한다', () => {
    render(<TastingEventInfoCard payload={{ ...payload, capacity: 0 }} />);

    expect(screen.getByText('모집 인원 미정')).toBeInTheDocument();
    expect(screen.queryByText('0명 정원')).not.toBeInTheDocument();
  });
});

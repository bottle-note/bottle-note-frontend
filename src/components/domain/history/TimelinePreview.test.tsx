// eslint-disable-next-line import/no-extraneous-dependencies
import { render, screen } from '@testing-library/react';
import type { ApiResponse } from '@/api/_shared/types';
import TimelinePreview from './TimelinePreview';

const historyData: ApiResponse<{
  userHistories: Array<{
    historyId: number;
    createdAt: string;
    eventCategory: 'RATING';
    eventType: 'START_RATING';
    alcoholId: number;
    alcoholName: string;
    imageUrl: string;
    redirectUrl: string;
    content: string;
    message: string;
    dynamicMessage: null;
  }>;
  subscriptionDate: string;
}>[] = [
  {
    success: true,
    code: 200,
    data: {
      userHistories: [
        {
          historyId: 1,
          createdAt: '2024-01-02T00:00:00',
          eventCategory: 'RATING',
          eventType: 'START_RATING',
          alcoholId: 1,
          alcoholName: '테스트 위스키',
          imageUrl: '',
          redirectUrl: '/search/whisky/1',
          content: '',
          message: '',
          dynamicMessage: null,
        },
      ],
      subscriptionDate: '2024-01-01T00:00:00',
    },
    errors: [],
    meta: {
      serverEncoding: 'UTF-8',
      serverVersion: '1',
      serverPathVersion: '1',
      serverResponseTime: '0',
    },
  },
];

describe('TimelinePreview', () => {
  it('콘텐츠 폭을 모두 쓰고, 점선 축은 왼쪽 날짜 칸 기준 위치를 유지한다', () => {
    render(<TimelinePreview data={historyData} />);

    const preview = screen.getByTestId('timeline-preview');
    expect(preview).toHaveClass('w-full');
    expect(preview).not.toHaveClass('max-w-399');
    expect(screen.getByTestId('timeline-axis')).toHaveClass('left-44');
  });
});

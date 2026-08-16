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
  it('가용 폭을 사용하되 399px을 넘지 않는다', () => {
    render(<TimelinePreview data={historyData} />);

    expect(screen.getByTestId('timeline-preview')).toHaveClass(
      'w-full',
      'max-w-[399px]',
    );
    expect(screen.getByTestId('timeline-axis')).toHaveClass('left-11');
  });
});

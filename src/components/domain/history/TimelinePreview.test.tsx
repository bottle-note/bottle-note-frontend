// eslint-disable-next-line import/no-extraneous-dependencies
import { render, screen } from '@testing-library/react';
import type { ApiResponse } from '@/api/_shared/types';
import TimelinePreview from './TimelinePreview';

const historyData: ApiResponse<{
  userHistories: [];
  subscriptionDate: string;
  totalCount: number;
}>[] = [
  {
    success: true,
    code: 200,
    data: {
      userHistories: [],
      subscriptionDate: '2024-01-01T00:00:00',
      totalCount: 1,
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

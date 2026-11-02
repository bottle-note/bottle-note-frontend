// eslint-disable-next-line import/no-extraneous-dependencies
import { render, screen } from '@testing-library/react';
import type { HistoryListResponse } from '@/api/history/types';
import TimelineFull from './TimelineFull';

const data = {
  userHistories: [
    {
      historyId: 1,
      createdAt: '2026-10-28T13:57:00',
      eventCategory: 'PICK',
      eventType: 'IS_PICK',
      alcoholId: 1,
      alcoholName: '글렌알라키 11년',
      imageUrl: '',
      redirectUrl: '/alcohols/1',
      content: '',
      message: '찜하기 하셨어요.',
      dynamicMessage: null,
    },
  ],
  subscriptionDate: '2026-01-01T00:00:00',
} as unknown as HistoryListResponse;

const baseProps = {
  isLastPage: true,
  currentUserInfo: null,
  handleOpenFilterModal: () => {},
};

describe('TimelineFull', () => {
  it('기록을 받기 전에도 렌더를 끝없이 반복하지 않는다', () => {
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(<TimelineFull {...baseProps} />);

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).includes('Maximum update depth'),
      ),
    ).toBe(false);
    consoleError.mockRestore();
  });

  it('받은 기록을 보여 준다', () => {
    render(<TimelineFull {...baseProps} data={data} />);

    expect(screen.getByText('글렌알라키 11년')).toBeInTheDocument();
  });
});

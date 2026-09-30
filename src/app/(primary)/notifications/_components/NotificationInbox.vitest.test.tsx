import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationInboxApi } from '@/api/notification/notification.api';
import type { NotificationAction } from '@/api/notification/types';
import { ReviewApi } from '@/api/review/review.api';
import { UserApi } from '@/api/user/user.api';
import { InquireApi } from '@/api/inquire/inquire.api';
import { ApiError } from '@/utils/ApiError';
import { NotificationInbox } from './NotificationInbox';

const { push, replace } = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace, back: vi.fn() }),
}));
vi.mock('@/hooks/auth/useAuthSession', () => ({
  useAuthSession: () => ({
    user: { userId: 7 },
    isLoggedIn: true,
    isLoading: false,
  }),
}));
vi.mock('@/lib/auth/session-store', () => ({
  getAuthSnapshot: () => ({ session: { user: { userId: 7 } } }),
}));
vi.mock('@/api/notification/notification.api', () => ({
  NotificationInboxApi: {
    getList: vi.fn(),
    getUnreadCount: vi.fn(),
    markRead: vi.fn(),
    markAllRead: vi.fn(),
  },
}));
vi.mock('@/api/review/review.api', () => ({
  ReviewApi: { getReviewDetails: vi.fn() },
}));
vi.mock('@/api/user/user.api', () => ({
  UserApi: { getUserInfo: vi.fn() },
}));
vi.mock('@/api/inquire/inquire.api', () => ({
  InquireApi: { getInquireDetails: vi.fn() },
}));

const notification = {
  id: 12,
  title: '내 리뷰에 댓글이 달렸어요',
  content: '새 댓글을 확인해 보세요.',
  eventAction: 'REVIEW_COMMENT_CREATE',
  group: 'REVIEW_AND_FOLLOW',
  status: 'SENT',
  isRead: false,
  createAt: '2026-09-29T12:00:00+09:00',
  readAt: null,
  action: {
    type: 'OPEN_REVIEW',
    targetId: 33,
    payload: { replyId: 44 },
    version: 1,
    fallbackType: 'OPEN_NOTIFICATION_CENTER',
  },
};

function renderInbox(action: NotificationAction | null = notification.action) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  vi.mocked(NotificationInboxApi.getList).mockResolvedValue({
    success: true,
    code: 200,
    data: { items: [{ ...notification, action }] },
    errors: [],
    meta: {
      serverEncoding: 'UTF-8',
      serverVersion: '1',
      serverPathVersion: 'v1',
      serverResponseTime: '2026-09-29T12:00:00+09:00',
      pagination: { hasNext: false, nextCursor: null },
    },
  });
  return render(
    <QueryClientProvider client={client}>
      <NotificationInbox />
    </QueryClientProvider>,
  );
}

describe('알림함', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(NotificationInboxApi.getUnreadCount).mockResolvedValue({
      unreadCount: 1,
    });
    vi.mocked(NotificationInboxApi.markRead).mockResolvedValue({
      notificationId: 12,
      isRead: true,
      readAt: '2026-09-29T12:05:00+09:00',
      changed: true,
      unreadCount: 0,
    });
    vi.mocked(NotificationInboxApi.markAllRead).mockResolvedValue({
      updatedCount: 1,
    });
    vi.mocked(ReviewApi.getReviewDetails).mockResolvedValue({} as never);
    vi.mocked(UserApi.getUserInfo).mockResolvedValue({} as never);
    vi.mocked(InquireApi.getInquireDetails).mockResolvedValue({} as never);
  });

  it('알림을 읽고 배지를 갱신한 뒤 지원 Action으로 이동한다', async () => {
    renderInbox();
    const row = await screen.findByRole('button', {
      name: /내 리뷰에 댓글이 달렸어요/,
    });
    expect(
      screen.getByRole('heading', { name: /새 알림/ }),
    ).toBeInTheDocument();
    fireEvent.click(row);
    await waitFor(() => {
      expect(NotificationInboxApi.markRead).toHaveBeenCalledWith(12);
      expect(push).toHaveBeenCalledWith('/review/33?scrollTo=replies');
    });
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(row.querySelector('[aria-label="읽지 않음"]')).toBeNull();
  });

  it('지원하지 않는 Action은 읽음만 처리하고 알림함에 머문다', async () => {
    renderInbox({ ...notification.action, type: 'UNKNOWN' });
    const row = await screen.findByRole('button', {
      name: /내 리뷰에 댓글이 달렸어요/,
    });
    fireEvent.click(row);
    await waitFor(() =>
      expect(NotificationInboxApi.markRead).toHaveBeenCalledWith(12),
    );
    expect(push).not.toHaveBeenCalled();
  });

  it.each([
    [
      { type: 'OPEN_REVIEW', targetId: 33, payload: {}, version: 2 },
      '/review/33',
    ],
    [{ type: 'OPEN_USER', targetId: 33, payload: {}, version: 1 }, '/user/33'],
    [
      { type: 'OPEN_HELP', targetId: 33, payload: {}, version: 1 },
      '/inquire/33',
    ],
  ])('%s Action의 대상 화면으로 이동한다', async (action, href) => {
    renderInbox({
      ...notification.action,
      ...action,
    });
    fireEvent.click(
      await screen.findByRole('button', {
        name: /내 리뷰에 댓글이 달렸어요/,
      }),
    );
    await waitFor(() => expect(push).toHaveBeenCalledWith(href));
  });

  it('대상이 삭제된 알림은 읽음 처리 후 알림함에 머문다', async () => {
    vi.mocked(ReviewApi.getReviewDetails).mockRejectedValue(
      new ApiError('Not found', new Response(null, { status: 404 })),
    );
    renderInbox();
    fireEvent.click(
      await screen.findByRole('button', {
        name: /내 리뷰에 댓글이 달렸어요/,
      }),
    );
    expect(
      await screen.findByText(
        '이동할 내용을 찾을 수 없어 알림함에 머물렀어요.',
      ),
    ).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it('모두 읽음을 누르면 서버 결과를 반영한다', async () => {
    vi.mocked(NotificationInboxApi.markAllRead).mockImplementation(async () => {
      vi.mocked(NotificationInboxApi.getUnreadCount).mockResolvedValue({
        unreadCount: 0,
      });
      return { updatedCount: 1 };
    });
    renderInbox();
    await screen.findByRole('button', { name: /내 리뷰에 댓글이 달렸어요/ });
    fireEvent.click(screen.getByRole('button', { name: '모두 읽음' }));
    await waitFor(() =>
      expect(NotificationInboxApi.markAllRead).toHaveBeenCalledOnce(),
    );
    await waitFor(() => expect(screen.getByText('0')).toBeInTheDocument());
  });
});

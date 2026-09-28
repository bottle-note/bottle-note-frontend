import { beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationSettingsApi } from '@/api/notification/notification.api';
import { NotificationSettings } from './NotificationSettings';

const { replace, auth } = vi.hoisted(() => ({
  replace: vi.fn(),
  auth: { isLoggedIn: true },
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace, back: vi.fn() }),
}));
vi.mock('@/hooks/auth/useAuthSession', () => ({
  useAuthSession: () => ({ isLoggedIn: auth.isLoggedIn, isLoading: false }),
}));
vi.mock('@/api/notification/notification.api', () => ({
  NotificationSettingsApi: { getSettings: vi.fn(), updateSettings: vi.fn() },
}));

const groups = [
  {
    group: 'REVIEW_AND_FOLLOW',
    displayName: '리뷰와 팔로우',
    settings: [
      {
        eventAction: 'REVIEW_LIKE_ADD',
        displayName: '내 리뷰의 좋아요',
        description: '',
        defaultEnabled: true,
        enabled: true,
      },
      {
        eventAction: 'FOLLOW_CREATE',
        displayName: '새 팔로워',
        description: '',
        defaultEnabled: true,
        enabled: false,
      },
    ],
  },
  {
    group: 'PROGRAM',
    displayName: '프로그램 소식',
    settings: [
      {
        eventAction: 'PROGRAM_OPEN',
        displayName: '새 프로그램',
        description: '프로그램이 등록됐을 때',
        defaultEnabled: true,
        enabled: false,
      },
    ],
  },
];

function response(data = groups) {
  return { groups: data };
}

function renderPage() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={client}>
      <NotificationSettings />
    </QueryClientProvider>,
  );
}

describe('알림 수신 설정', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.isLoggedIn = true;
    vi.mocked(NotificationSettingsApi.getSettings).mockResolvedValue(
      response(),
    );
    vi.mocked(NotificationSettingsApi.updateSettings).mockImplementation(
      async ({ settings }) =>
        response(
          groups.map((group) => ({
            ...group,
            settings: group.settings.map((item) => ({
              ...item,
              enabled:
                settings.find(
                  (change) => change.eventAction === item.eventAction,
                )?.enabled ?? item.enabled,
            })),
          })),
        ),
    );
  });

  it('서버 그룹과 값을 보여주고 전체 변경을 한 번에 저장해 갱신한다', async () => {
    renderPage();
    expect(await screen.findByText('프로그램 소식')).toBeInTheDocument();
    expect(screen.getByText('3개 중 1개 켜짐')).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('checkbox', { name: '전체 알림 일괄 변경' }),
    );
    expect(screen.getByText('3개 중 3개 켜짐')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '2개 변경사항 저장' }));
    await waitFor(() =>
      expect(NotificationSettingsApi.updateSettings).toHaveBeenCalledWith({
        settings: [
          { eventAction: 'FOLLOW_CREATE', enabled: true },
          { eventAction: 'PROGRAM_OPEN', enabled: true },
        ],
      }),
    );
    expect(
      await screen.findByText('변경사항을 저장했어요'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /변경사항 저장/ }),
    ).not.toBeInTheDocument();
  });

  it('처음에는 모든 항목이 보이고, 그룹을 접어도 일괄 토글을 유지하며 다시 펼칠 수 있다', async () => {
    renderPage();
    expect(
      await screen.findByRole('switch', { name: '새 프로그램' }),
    ).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: '프로그램 소식 접기' }));
    expect(
      screen.queryByRole('switch', { name: '새 프로그램' }),
    ).not.toBeInTheDocument();
    const groupToggle = screen.getByRole('checkbox', {
      name: '프로그램 소식 전체 변경',
    });
    fireEvent.click(groupToggle);
    expect(groupToggle).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(
      screen.getByRole('button', { name: '프로그램 소식 펼치기' }),
    );
    expect(screen.getByRole('switch', { name: '새 프로그램' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  it('개별 변경하고 되돌리면 저장 요청이 없다', async () => {
    renderPage();
    await screen.findByRole('switch', { name: '새 프로그램' });
    fireEvent.click(screen.getByRole('switch', { name: '새 프로그램' }));
    expect(
      screen.getByRole('button', { name: '1개 변경사항 저장' }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '되돌리기' }));
    expect(
      screen.queryByRole('button', { name: /변경사항 저장/ }),
    ).not.toBeInTheDocument();
    expect(NotificationSettingsApi.updateSettings).not.toHaveBeenCalled();
  });

  it('저장 실패 때 편집 값을 보존하고 다시 시도할 수 있다', async () => {
    vi.mocked(NotificationSettingsApi.updateSettings).mockRejectedValueOnce(
      new Error('request failed'),
    );
    renderPage();
    await screen.findByText('프로그램 소식');
    fireEvent.click(screen.getByRole('switch', { name: '새 팔로워' }));
    fireEvent.click(screen.getByRole('button', { name: '1개 변경사항 저장' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      '변경사항을 저장하지 못했어요',
    );
    expect(screen.getByRole('switch', { name: '새 팔로워' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(
      screen.getByRole('button', { name: '1개 변경사항 저장' }),
    ).toBeInTheDocument();
  });

  it('비로그인 직접 진입은 API를 조회하지 않고 복귀 경로가 있는 로그인으로 보낸다', async () => {
    auth.isLoggedIn = false;
    renderPage();
    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith(
        '/login?returnTo=%2Fsettings%2Fnotifications',
      ),
    );
    expect(NotificationSettingsApi.getSettings).not.toHaveBeenCalled();
  });
});

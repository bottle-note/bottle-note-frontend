import { beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationSettingsApi } from '@/api/notification/notification.api';
import { NotificationSettings } from './NotificationSettings';

const { replace, auth } = vi.hoisted(() => ({
  replace: vi.fn(),
  auth: { isLoggedIn: true, isLoading: false },
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace, back: vi.fn() }),
}));
vi.mock('@/hooks/auth/useAuthSession', () => ({
  useAuthSession: () => ({
    isLoggedIn: auth.isLoggedIn,
    isLoading: auth.isLoading,
  }),
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
    window.scrollTo = vi.fn();
    auth.isLoggedIn = true;
    auth.isLoading = false;
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

  it('설정을 불러오는 동안 화면 형태를 보여주고 응답 후 실제 항목을 표시한다', async () => {
    let resolveSettings!: (value: ReturnType<typeof response>) => void;
    vi.mocked(NotificationSettingsApi.getSettings).mockReturnValue(
      new Promise((resolve) => {
        resolveSettings = resolve;
      }),
    );

    renderPage();
    expect(
      screen.getByRole('status', { name: '알림 설정을 불러오는 중입니다.' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('switch', { name: '새 팔로워' })).toBeNull();

    resolveSettings(response());
    fireEvent.click(
      await screen.findByRole('button', { name: '리뷰와 팔로우 펼치기' }),
    );
    await waitFor(() =>
      expect(screen.getByRole('switch', { name: '새 팔로워' })).toBeVisible(),
    );
    expect(
      screen.queryByRole('status', { name: '알림 설정을 불러오는 중입니다.' }),
    ).toBeNull();
  });

  it('전체 토글은 해당 항목을 한 요청으로 바로 저장한다', async () => {
    renderPage();
    expect(await screen.findByText('프로그램')).toBeInTheDocument();
    expect(screen.getByText('3개 중 1개 켜짐')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox', { name: '전체 알림 변경' }));
    await waitFor(() =>
      expect(NotificationSettingsApi.updateSettings).toHaveBeenCalledWith({
        settings: [
          { eventAction: 'REVIEW_LIKE_ADD', enabled: true },
          { eventAction: 'FOLLOW_CREATE', enabled: true },
          { eventAction: 'PROGRAM_OPEN', enabled: true },
        ],
      }),
    );
    expect(await screen.findByText('3개 중 3개 켜짐')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /변경 저장/ })).toBeNull();
  });

  it('처음에는 모든 그룹이 닫히고, 그룹 토글은 닫힌 상태에서도 동작한다', async () => {
    renderPage();
    await screen.findByRole('button', { name: '프로그램 펼치기' });
    expect(
      screen.getByRole('button', { name: '리뷰와 팔로우 펼치기' }),
    ).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByRole('switch', { name: '새 프로그램' }),
    ).not.toBeInTheDocument();
    const groupToggle = screen.getByRole('checkbox', {
      name: '프로그램 전체 변경',
    });
    fireEvent.click(groupToggle);
    await waitFor(() =>
      expect(NotificationSettingsApi.updateSettings).toHaveBeenCalledWith({
        settings: [{ eventAction: 'PROGRAM_OPEN', enabled: true }],
      }),
    );
    await waitFor(() =>
      expect(groupToggle).toHaveAttribute('aria-checked', 'true'),
    );
    fireEvent.click(screen.getByRole('button', { name: '프로그램 펼치기' }));
    expect(screen.getByRole('switch', { name: '새 프로그램' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    fireEvent.click(screen.getByRole('button', { name: '프로그램 접기' }));
    expect(
      screen.queryByRole('switch', { name: '새 프로그램' }),
    ).not.toBeInTheDocument();
  });

  it('그룹과 항목은 문구 맵을 쓰고 새 서버 키는 서버 표시명을 사용한다', async () => {
    vi.mocked(NotificationSettingsApi.getSettings).mockResolvedValue(
      response([
        ...groups,
        {
          group: 'NEW_GROUP',
          displayName: '새 알림 그룹',
          settings: [
            {
              eventAction: 'NEW_ACTION',
              displayName: '새 알림 항목',
              description: '',
              defaultEnabled: true,
              enabled: true,
            },
          ],
        },
      ]),
    );

    renderPage();
    expect(
      await screen.findByRole('button', { name: '프로그램 펼치기' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('프로그램 소식')).toBeNull();
    fireEvent.click(
      screen.getByRole('button', { name: '리뷰와 팔로우 펼치기' }),
    );
    expect(
      screen.getByRole('switch', { name: '내 리뷰에 달린 좋아요' }),
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: '새 알림 그룹 펼치기' }),
    );
    expect(
      screen.getByRole('switch', { name: '새 알림 항목' }),
    ).toBeInTheDocument();
  });

  it('항목이 없는 그룹은 빈 저장 요청을 보내지 않는다', async () => {
    vi.mocked(NotificationSettingsApi.getSettings).mockResolvedValue(
      response([
        groups[0],
        { group: 'PROGRAM', displayName: '프로그램 소식', settings: [] },
      ]),
    );
    renderPage();
    expect(
      await screen.findByRole('checkbox', { name: '프로그램 전체 변경' }),
    ).toBeDisabled();
    expect(NotificationSettingsApi.updateSettings).not.toHaveBeenCalled();
  });

  it('개별 토글은 해당 항목 하나만 즉시 저장하고 응답 전에도 값을 반영한다', async () => {
    let resolveUpdate!: (value: ReturnType<typeof response>) => void;
    vi.mocked(NotificationSettingsApi.updateSettings).mockReturnValue(
      new Promise((resolve) => {
        resolveUpdate = resolve;
      }),
    );
    renderPage();
    fireEvent.click(
      await screen.findByRole('button', { name: '프로그램 펼치기' }),
    );
    fireEvent.click(screen.getByRole('switch', { name: '새 프로그램' }));
    await waitFor(() =>
      expect(NotificationSettingsApi.updateSettings).toHaveBeenCalledWith({
        settings: [{ eventAction: 'PROGRAM_OPEN', enabled: true }],
      }),
    );
    expect(screen.getByRole('switch', { name: '새 프로그램' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByRole('switch', { name: '새 프로그램' })).toBeDisabled();
    resolveUpdate(
      response(
        groups.map((group) => ({
          ...group,
          settings: group.settings.map((item) => ({
            ...item,
            enabled: item.eventAction === 'PROGRAM_OPEN' || item.enabled,
          })),
        })),
      ),
    );
    await waitFor(() =>
      expect(screen.getByRole('switch', { name: '새 프로그램' })).toBeEnabled(),
    );
  });

  it('저장 실패 때 이전 값으로 되돌리고 다시 시도할 수 있다', async () => {
    vi.mocked(NotificationSettingsApi.updateSettings).mockRejectedValueOnce(
      new Error('request failed'),
    );
    renderPage();
    fireEvent.click(
      await screen.findByRole('button', { name: '리뷰와 팔로우 펼치기' }),
    );
    fireEvent.click(screen.getByRole('switch', { name: '새 팔로워' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      '알림 설정을 저장하지 못했습니다',
    );
    expect(screen.getByRole('switch', { name: '새 팔로워' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
    fireEvent.click(screen.getByRole('switch', { name: '새 팔로워' }));
    await waitFor(() =>
      expect(NotificationSettingsApi.updateSettings).toHaveBeenCalledTimes(2),
    );
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

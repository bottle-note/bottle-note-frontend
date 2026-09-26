import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
// eslint-disable-next-line import/no-extraneous-dependencies
import { render, screen } from '@testing-library/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import LoginModal from './LoginModal';

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

vi.mock('@/components/ui/Modal/BackDrop', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

const mockUsePathname = usePathname as Mock;
const mockUseRouter = useRouter as Mock;
const mockUseSearchParams = useSearchParams as Mock;
const mockPush = vi.fn();

describe('LoginModal returnTo 사용자 시나리오', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    mockUseRouter.mockReturnValue({ push: mockPush });
    mockUsePathname.mockReturnValue('/explore');
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams(
        'tab=EXPLORER_WHISKEY&keywords=macallan&regionIds=12',
      ),
    );
  });

  it('일반 로그인은 현재 pathname과 search params 전체를 복귀 쿼리로 전달한다', () => {
    const handleClose = vi.fn();

    render(<LoginModal handleClose={handleClose} />);

    screen.getByRole('button', { name: '로그인' }).click();

    const params = new URLSearchParams(mockPush.mock.calls[0][0].split('?')[1]);
    expect(params.get('returnTo')).toBe(
      '/explore?tab=EXPLORER_WHISKEY&keywords=macallan&regionIds=12',
    );
    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith(expect.stringMatching(/^\/login\?/));
  });

  it('명시적인 returnTo가 있으면 현재 URL보다 해당 경로를 복귀 쿼리로 전달한다', () => {
    const handleClose = vi.fn();

    render(
      <LoginModal handleClose={handleClose} returnTo="/inquire/register" />,
    );

    screen.getByRole('button', { name: '로그인' }).click();

    const params = new URLSearchParams(mockPush.mock.calls[0][0].split('?')[1]);
    expect(params.get('returnTo')).toBe('/inquire/register');
    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith(expect.stringMatching(/^\/login\?/));
  });
});

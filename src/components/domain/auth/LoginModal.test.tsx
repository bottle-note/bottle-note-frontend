// eslint-disable-next-line import/no-extraneous-dependencies
import { render, screen } from '@testing-library/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import LoginModal from './LoginModal';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('@/components/ui/Modal/BackDrop', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

const mockUsePathname = usePathname as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;
const mockUseSearchParams = useSearchParams as jest.Mock;
const mockPush = jest.fn();

describe('LoginModal returnTo 사용자 시나리오', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    const handleClose = jest.fn();

    render(<LoginModal handleClose={handleClose} />);

    screen.getByRole('button', { name: '로그인' }).click();

    const params = new URLSearchParams(mockPush.mock.calls[0][0].split('?')[1]);
    expect(params.get('returnTo')).toBe(
      '/explore?tab=EXPLORER_WHISKEY&keywords=macallan&regionIds=12',
    );
    expect(params.get('cancelTo')).toBe(params.get('returnTo'));
    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith(expect.stringMatching(/^\/login\?/));
  });

  it('명시적인 returnTo가 있으면 현재 URL보다 해당 경로를 복귀 쿼리로 전달한다', () => {
    const handleClose = jest.fn();

    render(
      <LoginModal handleClose={handleClose} returnTo="/inquire/register" />,
    );

    screen.getByRole('button', { name: '로그인' }).click();

    const params = new URLSearchParams(mockPush.mock.calls[0][0].split('?')[1]);
    expect(params.get('returnTo')).toBe('/inquire/register');
    expect(params.get('cancelTo')).toBe(
      '/explore?tab=EXPLORER_WHISKEY&keywords=macallan&regionIds=12',
    );
    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith(expect.stringMatching(/^\/login\?/));
  });
});

// eslint-disable-next-line import/no-extraneous-dependencies
import { render, screen } from '@testing-library/react';
import Navbar from './Navbar';

const mockUseScrollState = jest.fn();

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({
    alt = '',
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}));

jest.mock('next/navigation', () => ({
  usePathname: () => '/explore',
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/hooks/auth/useAuth', () => ({
  useAuth: () => ({ user: null, isLoggedIn: false }),
}));

jest.mock('@/store/modalStore', () => ({
  __esModule: true,
  default: () => ({ handleLoginModal: jest.fn() }),
}));

jest.mock('@/utils/flutterUtil', () => ({
  handleWebViewMessage: jest.fn(),
}));

jest.mock('@/hooks/useScrollState', () => ({
  useScrollState: () => mockUseScrollState(),
}));

describe('Navbar suppression', () => {
  beforeEach(() => {
    mockUseScrollState.mockReturnValue({ isVisible: true, isAtTop: true });
  });

  it('기본 상태에서는 scroll visibility에 따라 노출된다', () => {
    render(<Navbar />);

    const navbar = screen.getByRole('navigation');
    expect(navbar).toHaveClass('translate-y-0');
    expect(navbar).toHaveAttribute('aria-hidden', 'false');
  });

  it('suppression이 scroll visibility보다 우선한다', () => {
    render(<Navbar isSuppressed />);

    const navbar = screen.getByRole('navigation', { hidden: true });
    expect(navbar).toHaveClass(
      'pointer-events-none',
      'translate-y-[calc(100%+var(--navbar-margin-bottom))]',
    );
    expect(navbar).toHaveAttribute('aria-hidden', 'true');
    expect(navbar.querySelector('button')).toHaveAttribute('tabindex', '-1');
  });
});

// eslint-disable-next-line import/no-extraneous-dependencies
import { fireEvent, render, screen } from '@testing-library/react';
import NavLayout, { useNavLayout } from './NavLayout';

jest.mock('@/hooks/useScrollState', () => ({
  useScrollState: () => ({ isVisible: true, isAtTop: true }),
}));

jest.mock('@/components/ui/Navigation/Navbar', () => ({
  __esModule: true,
  default: ({
    isSuppressed,
    isScrollVisible,
  }: {
    isSuppressed?: boolean;
    isScrollVisible?: boolean;
  }) => (
    <nav
      data-suppressed={String(isSuppressed)}
      data-scroll-visible={String(isScrollVisible)}
    >
      navbar
    </nav>
  ),
}));

function SuppressionControl() {
  const { setNavbarSuppressed } = useNavLayout();

  return (
    <>
      <button type="button" onClick={() => setNavbarSuppressed(true)}>
        suppress
      </button>
      <button type="button" onClick={() => setNavbarSuppressed(false)}>
        restore
      </button>
    </>
  );
}

describe('NavLayout', () => {
  it('route child가 Navbar suppression을 켜고 해제할 수 있다', () => {
    render(
      <NavLayout>
        <SuppressionControl />
      </NavLayout>,
    );

    const navbar = screen.getByRole('navigation');
    expect(navbar).toHaveAttribute('data-suppressed', 'false');
    expect(navbar).toHaveAttribute('data-scroll-visible', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'suppress' }));
    expect(navbar).toHaveAttribute('data-suppressed', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'restore' }));
    expect(navbar).toHaveAttribute('data-suppressed', 'false');
  });

  it('Navbar 비노출 layout에서도 context를 제공한다', () => {
    render(
      <NavLayout showNavbar={false}>
        <SuppressionControl />
      </NavLayout>,
    );

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'suppress' }),
    ).toBeInTheDocument();
  });
});

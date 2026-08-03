import { render, screen } from '@testing-library/react';
import AlcoholPickButton from './AlcoholPickButton';

jest.mock('@/hooks/auth/useAuthSession', () => ({
  useAuthSession: () => ({ isLoggedIn: true }),
}));

jest.mock('@/hooks/useDebouncedToggle', () => ({
  useDebouncedToggle: () => ({ handleToggle: jest.fn() }),
}));

describe('AlcoholPickButton', () => {
  const defaultProps = {
    isPicked: false,
    alcoholId: 274,
    handleUpdatePicked: jest.fn(),
    handleNotLogin: jest.fn(),
    pickBtnName: '찜하기',
  };

  it('브랜드 배경에서는 대비 역할 색상을 사용한다', () => {
    render(<AlcoholPickButton {...defaultProps} />);

    expect(screen.getByRole('button', { name: '찜하기' })).toHaveClass(
      'text-fg-brand-contrast',
    );
    expect(
      screen
        .getByRole('button', { name: '찜하기' })
        .querySelector(
          '[data-semantic-icon="/icon/pick-outlined-subcoral.svg"]',
        ),
    ).toBeInTheDocument();
  });

  it('일반 배경에서는 브랜드 역할 색상을 사용할 수 있다', () => {
    render(<AlcoholPickButton {...defaultProps} isPicked tone="brand" />);

    const button = screen.getByRole('button', { name: '찜 취소' });
    expect(button).toHaveClass('text-fg-brand');
    expect(
      button.querySelector(
        '[data-semantic-icon="/icon/pick-filled-subcoral.svg"]',
      ),
    ).toBeInTheDocument();
  });
});

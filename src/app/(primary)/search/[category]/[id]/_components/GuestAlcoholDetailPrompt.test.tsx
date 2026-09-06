import { fireEvent, render, screen } from '@testing-library/react';

import { GuestAlcoholDetailPrompt } from './GuestAlcoholDetailPrompt';

describe('GuestAlcoholDetailPrompt', () => {
  it('상세 preview 없이 로그인 CTA만 노출하고 선택을 전달한다', () => {
    const handleLogin = jest.fn();

    const { container } = render(
      <GuestAlcoholDetailPrompt onLogin={handleLogin} />,
    );

    expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
    expect(
      screen.getByRole('heading', {
        name: '지금 보고 계신 위스키, 관심 있으신가요?',
      }),
    ).toBeTruthy();
    expect(
      screen.getByText('보틀노트에 기록하고 나만의 취향 노트를 쌓아보세요!'),
    ).toBeTruthy();

    fireEvent.click(
      screen.getByRole('button', { name: '로그인하고 기록 시작하기' }),
    );

    expect(handleLogin).toHaveBeenCalledTimes(1);
  });
});

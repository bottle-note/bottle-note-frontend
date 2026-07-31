// eslint-disable-next-line import/no-extraneous-dependencies
import { fireEvent, render, screen } from '@testing-library/react';
import UnderlineSearchBar from './UnderlineSearchBar';

jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}));

describe('UnderlineSearchBar', () => {
  it('검색 입력에 시맨틱 테두리와 placeholder 색상을 사용한다', () => {
    render(<UnderlineSearchBar />);

    expect(screen.getByRole('textbox')).toHaveClass(
      'border-stroke-neutral-subtle',
      'placeholder:text-fg-neutral-muted',
    );
  });

  it('input focus와 blur 상태를 외부에 전달한다', () => {
    const onFocusChange = jest.fn();

    render(<UnderlineSearchBar onFocusChange={onFocusChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    expect(onFocusChange).toHaveBeenLastCalledWith(true);

    fireEvent.blur(input);
    expect(onFocusChange).toHaveBeenLastCalledWith(false);
  });

  it('검색어 초기화 후 input focus와 활성 상태를 유지한다', () => {
    const onFocusChange = jest.fn();

    render(
      <UnderlineSearchBar
        initialValue="macallan"
        onFocusChange={onFocusChange}
        clearable
      />,
    );

    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    fireEvent.click(screen.getByRole('button', { name: '검색어 지우기' }));

    expect(input).toHaveValue('');
    expect(input).toHaveFocus();
    expect(onFocusChange).toHaveBeenLastCalledWith(true);
  });
});

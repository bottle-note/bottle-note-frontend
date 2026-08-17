import { fireEvent, render, screen } from '@testing-library/react';
import Label from './Label';

describe('Label', () => {
  it('클릭 동작이 없는 라벨은 읽기용 텍스트로 표시한다', () => {
    render(<Label name="바닐라" />);

    expect(screen.getByText('바닐라').tagName).toBe('SPAN');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('클릭 가능한 라벨은 버튼으로 기존 동작을 수행한다', () => {
    const handleClick = jest.fn();
    render(<Label name="서비스 문의" onClick={handleClick} />);

    fireEvent.click(screen.getByRole('button', { name: '서비스 문의' }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

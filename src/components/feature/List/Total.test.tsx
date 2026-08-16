// eslint-disable-next-line import/no-extraneous-dependencies
import { render, screen } from '@testing-library/react';
import Total from './Total';
import List from './List';

describe('List Total', () => {
  it('total 값이 없으면 총계 문구를 렌더링하지 않는다', () => {
    const { rerender } = render(<Total total={undefined} />);

    expect(screen.queryByText(/^총 /)).not.toBeInTheDocument();

    rerender(<Total total={null} />);

    expect(screen.queryByText(/^총 /)).not.toBeInTheDocument();
  });

  it('0을 포함한 number 값은 단위와 함께 렌더링한다', () => {
    const { rerender } = render(<Total total={0} />);

    expect(screen.getByText('총 0개')).toBeInTheDocument();

    rerender(<Total total={12} unit="명" />);

    expect(screen.getByText('총 12명')).toBeInTheDocument();
  });

  it('값 없는 Total만 전달되면 List 관리 영역도 렌더링하지 않는다', () => {
    const { container } = render(
      <List>
        <List.Total total={undefined} />
        <List.Section>
          <div>목록 항목</div>
        </List.Section>
      </List>,
    );

    expect(container.querySelector('article')).not.toBeInTheDocument();
    expect(screen.getByText('목록 항목')).toBeInTheDocument();
  });
});

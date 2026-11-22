// eslint-disable-next-line import/no-extraneous-dependencies
import { render, screen } from '@testing-library/react';
import TimeLineItem from './TimeLineItem';

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

jest.mock('@/components/ui/Display/BaseImage', () => ({
  __esModule: true,
  default: () => <div data-testid="alcohol-image" />,
}));

describe('TimeLineItem', () => {
  it('활동 카드는 날짜 칸을 뺀 남은 폭을 모두 쓰고, 긴 술 이름은 글자 수가 아니라 폭에 맞춰 줄인다', () => {
    const longName =
      '글렌드로낙 21년 팔리아먼트 올로로소 페드로 히메네스 셰리 캐스크';
    render(
      <TimeLineItem
        date="2024-01-01T12:30:00"
        type="IS_PICK"
        alcoholName={longName}
      />,
    );

    expect(screen.getByTestId('timeline-item')).toHaveClass('w-full', 'gap-10');
    expect(screen.getByTestId('timeline-date')).toHaveClass('w-24', 'shrink-0');
    const link = screen.getByRole('link');
    expect(link).toHaveClass('w-full');
    expect(link).not.toHaveClass('max-w-336');
    expect(screen.getByText(longName)).toHaveClass('truncate');
  });

  it('시작 활동 카드도 남은 폭을 모두 쓴다', () => {
    render(<TimeLineItem isStart date="2024-01-01T12:30:00" type="BOTTLE" />);

    const card = screen.getByText('보틀노트를 시작하신 날이에요.');
    expect(card).toHaveClass('w-full');
    expect(card).not.toHaveClass('max-w-336');
  });
});

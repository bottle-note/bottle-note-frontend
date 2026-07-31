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
  it('활동 카드는 남은 폭을 사용하되 336px을 넘지 않는다', () => {
    render(
      <TimeLineItem
        date="2024-01-01T12:30:00"
        type="IS_PICK"
        alcoholName="테스트 위스키"
      />,
    );

    expect(screen.getByTestId('timeline-item')).toHaveClass(
      'w-full',
      'gap-2.5',
    );
    expect(screen.getByTestId('timeline-date')).toHaveClass('w-6', 'shrink-0');
    expect(screen.getByRole('link')).toHaveClass('w-full', 'max-w-[21rem]');
  });

  it('시작 활동 카드에도 같은 최대 폭을 적용한다', () => {
    render(<TimeLineItem isStart date="2024-01-01T12:30:00" type="BOTTLE" />);

    expect(screen.getByText('보틀노트를 시작하신 날이에요.')).toHaveClass(
      'w-full',
      'max-w-[21rem]',
    );
  });
});

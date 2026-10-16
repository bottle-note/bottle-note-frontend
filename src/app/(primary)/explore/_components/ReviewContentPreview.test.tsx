// eslint-disable-next-line import/no-extraneous-dependencies
import { render, screen } from '@testing-library/react';
import ReviewContentPreview from './ReviewContentPreview';

// jsdom은 레이아웃을 계산하지 않으므로 4줄 영역과 실제 본문 높이를 지정한다.
const setTextHeight = (scrollHeight: number) => {
  jest.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(76);
  jest
    .spyOn(HTMLElement.prototype, 'scrollHeight', 'get')
    .mockReturnValue(scrollHeight);
};

describe('둘러보기 리뷰 본문', () => {
  afterEach(() => jest.restoreAllMocks());

  it('4줄을 넘는 본문은 더보기를 표시한다', () => {
    setTextHeight(114);
    render(<ReviewContentPreview content={'향: 건포도\n맛: 꿀\n'.repeat(4)} />);

    expect(screen.getByText('... 더보기')).toBeInTheDocument();
  });

  it('4줄 이하 본문은 더보기 없이 모두 보여준다', () => {
    setTextHeight(76);
    render(<ReviewContentPreview content="피트 입문용으로 추천." />);

    expect(screen.getByText('피트 입문용으로 추천.')).toBeInTheDocument();
    expect(screen.queryByText('... 더보기')).not.toBeInTheDocument();
  });

  it('본문에 들어 있는 HTML은 실행하지 않고 글자로 보여준다', () => {
    setTextHeight(76);
    const { container } = render(
      <ReviewContentPreview content={'<img src=x onerror="alert(1)">맛있다'} />,
    );

    expect(container.querySelector('img')).toBeNull();
    expect(
      screen.getByText('<img src=x onerror="alert(1)">맛있다'),
    ).toBeInTheDocument();
  });
});

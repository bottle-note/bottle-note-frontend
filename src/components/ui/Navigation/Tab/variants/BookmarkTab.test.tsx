// eslint-disable-next-line import/no-extraneous-dependencies
import { render, screen } from '@testing-library/react';
import BookmarkTab from './BookmarkTab';

const tabs = [
  { id: 'whiskey', name: '위스키' },
  { id: 'wine', name: '와인' },
];

describe('BookmarkTab', () => {
  it('다크 semantic border를 SVG 외곽선과 비활성 하단선에 일관되게 전달한다', () => {
    const { container } = render(
      <BookmarkTab currentTab={tabs[0]} handleTab={jest.fn()} tabList={tabs} />,
    );

    const [activeTabSvg, inactiveTabSvg] = Array.from(
      container.querySelectorAll('svg'),
    );

    expect(activeTabSvg).toHaveStyle('color: hsl(var(--bn-bookmark-border))');
    expect(activeTabSvg.querySelector('path[stroke]')).toHaveAttribute(
      'stroke',
      'currentColor',
    );
    expect(inactiveTabSvg.querySelector('line')).toHaveAttribute(
      'stroke',
      'currentColor',
    );
  });

  it('탭 선택은 기존 핸들러에 위임한다', () => {
    const handleTab = jest.fn();

    render(
      <BookmarkTab currentTab={tabs[0]} handleTab={handleTab} tabList={tabs} />,
    );

    screen.getByRole('button', { name: '와인' }).click();

    expect(handleTab).toHaveBeenCalledWith('wine');
  });
});

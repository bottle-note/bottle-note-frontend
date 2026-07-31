import { render, screen } from '@testing-library/react';
import BookmarkTab from './BookmarkTab';

describe('BookmarkTab', () => {
  it('floating 표면에서는 활성 탭 배경을 바텀시트 표면과 맞춘다', () => {
    const tab = { id: 'category', name: '카테고리' };
    const { container } = render(
      <BookmarkTab
        currentTab={tab}
        handleTab={jest.fn()}
        tabList={[tab]}
        surface="floating"
      />,
    );

    expect(container.firstElementChild).toHaveClass('bg-bg-layer-floating');
    expect(
      screen.getByRole('button', { name: '카테고리' }).querySelector('rect'),
    ).toHaveAttribute('fill', 'var(--color-bg-layer-floating)');
  });
});

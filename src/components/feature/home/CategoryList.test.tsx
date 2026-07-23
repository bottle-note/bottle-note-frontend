// eslint-disable-next-line import/no-extraneous-dependencies
import { render, screen } from '@testing-library/react';
import { WHISKEY_EXPLORE_TAB_ID } from '@/app/(primary)/explore/_constants/exploreTabs';
import { ROUTES } from '@/constants/routes';
import type { LinkData } from '@/types/LinkButton';
import { getFilteredCategories } from '@/utils/categoryUtils';
import CategoryList from './CategoryList';

jest.mock('@/components/ui/Button/PrimaryLinkButton', () => ({
  __esModule: true,
  default: ({ data }: { data: LinkData }) => {
    const href =
      typeof data.linkSrc === 'string' ? data.linkSrc : data.linkSrc.pathname;

    return <a href={href}>{data.korName}</a>;
  },
}));

describe('CategoryList navigation', () => {
  it('개별 홈 카테고리를 선택한 필터가 적용된 위스키 둘러보기 탭으로 연결한다', () => {
    render(<CategoryList />);

    const categoryLinks = screen.getAllByRole('link');
    const filteredCategories = getFilteredCategories();

    expect(categoryLinks).toHaveLength(filteredCategories.length + 1);

    filteredCategories.forEach((category, index) => {
      const href = new URL(
        categoryLinks[index].getAttribute('href') ?? '',
        'http://localhost',
      );

      expect(href.pathname).toBe(ROUTES.EXPLORE.BASE);
      expect(href.searchParams.get('tab')).toBe(WHISKEY_EXPLORE_TAB_ID);
      expect(href.searchParams.get('category')).toBe(category.link);
    });
  });

  it('전체 카테고리를 필터 없는 위스키 둘러보기 탭으로 연결한다', () => {
    render(<CategoryList />);

    const href = new URL(
      screen.getByRole('link', { name: '전체' }).getAttribute('href') ?? '',
      'http://localhost',
    );

    expect(href.pathname).toBe(ROUTES.EXPLORE.BASE);
    expect(href.searchParams.get('tab')).toBe(WHISKEY_EXPLORE_TAB_ID);
    expect(href.searchParams.has('category')).toBe(false);
  });
});

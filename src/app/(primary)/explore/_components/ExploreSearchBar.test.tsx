// eslint-disable-next-line import/no-extraneous-dependencies
import { fireEvent, render, screen } from '@testing-library/react';
import { ExploreSearchBar } from './ExploreSearchBar';

const mockUseNavLayout = jest.fn();

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

jest.mock('@/queries/useRegionsQuery', () => ({
  useRegionsQuery: () => ({
    regions: [{ regionId: 0, korName: '전체', engName: 'ALL' }],
  }),
}));

jest.mock('@/components/ui/Layout/NavLayout', () => ({
  useNavLayout: () => mockUseNavLayout(),
}));

jest.mock('../_hooks/useExploreFilters', () => ({
  useExploreFilters: () => ({
    regionIds: [],
    category: '',
    toggleRegionId: jest.fn(),
    clearRegionIds: jest.fn(),
    toggleCategory: jest.fn(),
    clearCategory: jest.fn(),
  }),
}));

describe('ExploreSearchBar', () => {
  beforeEach(() => {
    mockUseNavLayout.mockReturnValue({ isScrollVisible: true });
  });

  it('realtime 모드에서는 검색어 추가 버튼 없이 입력 변경을 전달한다', () => {
    const onValueChange = jest.fn();
    const onSearchActiveChange = jest.fn();

    render(
      <ExploreSearchBar
        mode="realtime"
        initialValue="mac"
        onValueChange={onValueChange}
        isSearchActive={false}
        onSearchActiveChange={onSearchActiveChange}
        description="이름이나 플레이버 태그를 입력해 검색해보세요."
        isFilter
      />,
    );

    const input = screen.getByRole('textbox', { name: '위스키 검색' });
    expect(input).toHaveValue('mac');
    expect(screen.queryByText('+ 검색어 추가')).not.toBeInTheDocument();
    expect(
      screen.getByText('이름이나 플레이버 태그를 입력해 검색해보세요.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('검색 중...')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '필터메뉴' }),
    ).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'macallan' } });
    expect(onValueChange).toHaveBeenCalledWith('macallan');

    fireEvent.focus(input);
    expect(onSearchActiveChange).toHaveBeenLastCalledWith(true);

    fireEvent.click(screen.getByRole('button', { name: '검색어 지우기' }));
    expect(input).toHaveValue('');
    expect(input).toHaveFocus();
    expect(onValueChange).toHaveBeenLastCalledWith('');
    expect(onSearchActiveChange).toHaveBeenLastCalledWith(true);

    fireEvent.blur(input);
    expect(onSearchActiveChange).toHaveBeenLastCalledWith(false);
  });

  it('스크롤 방향 상태에 따라 sticky 검색바를 숨기고 다시 노출한다', () => {
    const props = {
      mode: 'realtime' as const,
      initialValue: '',
      onValueChange: jest.fn(),
      isSearchActive: false,
      onSearchActiveChange: jest.fn(),
      description: '검색어를 입력해보세요.',
    };
    const { rerender } = render(<ExploreSearchBar {...props} />);

    const searchBar = screen.getByTestId('explore-search-bar');
    expect(searchBar).toHaveClass(
      'sticky',
      'translate-y-0',
      'transition-[top,transform]',
      'duration-150',
      'ease-out',
      'motion-reduce:transition-none',
    );
    expect(searchBar).toHaveStyle({
      top: 'var(--explore-current-header-height)',
    });

    mockUseNavLayout.mockReturnValue({ isScrollVisible: false });
    rerender(<ExploreSearchBar {...props} />);

    expect(searchBar).toHaveClass(
      '-translate-y-full',
      'pointer-events-none',
      'transition-[top,transform]',
      '[transition-duration:120ms]',
      'ease-in',
      'motion-reduce:transition-none',
    );
    expect(searchBar).not.toHaveClass('duration-150');

    rerender(<ExploreSearchBar {...props} isSearchActive />);

    expect(searchBar).toHaveClass('translate-y-0', 'pointer-events-auto');
    expect(searchBar).not.toHaveClass('-translate-y-full');
  });

  it('chip 모드에서는 기존 검색어 추가 동작을 유지한다', () => {
    const handleAddKeyword = jest.fn();
    const handleSearch = jest.fn();
    const onSearchActiveChange = jest.fn();

    render(
      <ExploreSearchBar
        mode="chip"
        handleAddKeyword={handleAddKeyword}
        handleSearch={handleSearch}
        isSearchActive={false}
        onSearchActiveChange={onSearchActiveChange}
        description="검색어를 추가해보세요."
      />,
    );

    const input = screen.getByRole('textbox', { name: '검색어 입력' });

    fireEvent.focus(input);
    expect(onSearchActiveChange).toHaveBeenLastCalledWith(true);

    fireEvent.change(input, {
      target: { value: ' peaty ' },
    });
    fireEvent.click(screen.getByRole('button', { name: '+ 검색어 추가' }));

    expect(handleAddKeyword).toHaveBeenCalledWith({
      label: 'peaty',
      value: 'peaty',
    });
    expect(handleSearch).toHaveBeenCalledTimes(1);

    fireEvent.blur(input);
    expect(onSearchActiveChange).toHaveBeenLastCalledWith(false);
  });
});

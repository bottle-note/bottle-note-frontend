// eslint-disable-next-line import/no-extraneous-dependencies
import { fireEvent, render, screen } from '@testing-library/react';
import { ExploreSearchBar } from './ExploreSearchBar';

const mockUseScrollState = jest.fn();

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

jest.mock('@/hooks/useScrollState', () => ({
  useScrollState: () => mockUseScrollState(),
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
    mockUseScrollState.mockReturnValue({ isVisible: true, isAtTop: true });
  });

  it('realtime 모드에서는 검색어 추가 버튼 없이 입력 변경을 전달한다', () => {
    const onValueChange = jest.fn();

    render(
      <ExploreSearchBar
        mode="realtime"
        initialValue="mac"
        onValueChange={onValueChange}
        description="이름이나 플레이버 태그를 입력해 검색해보세요."
        isFilter
      />,
    );

    const input = screen.getByRole('textbox');
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

    fireEvent.click(screen.getByRole('button', { name: '검색어 지우기' }));
    expect(input).toHaveValue('');
    expect(input).toHaveFocus();
    expect(onValueChange).toHaveBeenLastCalledWith('');
  });

  it('스크롤 방향 상태에 따라 sticky 검색바를 숨기고 다시 노출한다', () => {
    const props = {
      mode: 'realtime' as const,
      initialValue: '',
      onValueChange: jest.fn(),
      description: '검색어를 입력해보세요.',
    };
    const { rerender } = render(<ExploreSearchBar {...props} />);

    const searchBar = screen.getByTestId('explore-search-bar');
    expect(searchBar).toHaveClass(
      'sticky',
      'translate-y-0',
      'transition-transform',
      'duration-150',
      'ease-out',
      'motion-reduce:transition-none',
    );
    expect(searchBar).toHaveStyle({
      top: 'calc(var(--header-height-with-safe) + var(--tab-height))',
    });

    mockUseScrollState.mockReturnValue({ isVisible: false, isAtTop: false });
    rerender(<ExploreSearchBar {...props} />);

    expect(searchBar).toHaveClass(
      '-translate-y-full',
      'pointer-events-none',
      'transition-none',
    );
    expect(searchBar).not.toHaveClass('duration-150');
  });

  it('chip 모드에서는 기존 검색어 추가 동작을 유지한다', () => {
    const handleAddKeyword = jest.fn();
    const handleSearch = jest.fn();

    render(
      <ExploreSearchBar
        mode="chip"
        handleAddKeyword={handleAddKeyword}
        handleSearch={handleSearch}
        description="검색어를 추가해보세요."
      />,
    );

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: ' peaty ' },
    });
    fireEvent.click(screen.getByRole('button', { name: '+ 검색어 추가' }));

    expect(handleAddKeyword).toHaveBeenCalledWith({
      label: 'peaty',
      value: 'peaty',
    });
    expect(handleSearch).toHaveBeenCalledTimes(1);
  });
});

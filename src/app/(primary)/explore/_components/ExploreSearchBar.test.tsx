// eslint-disable-next-line import/no-extraneous-dependencies
import { fireEvent, render, screen } from '@testing-library/react';
import { ExploreSearchBar } from './ExploreSearchBar';

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
  it('realtime 모드에서는 검색어 추가 버튼 없이 입력 변경을 전달한다', () => {
    const onValueChange = jest.fn();

    render(
      <ExploreSearchBar
        mode="realtime"
        initialValue="mac"
        onValueChange={onValueChange}
        description="이름이나 플레이버 태그를 입력해 검색해보세요."
        isSearching
        isFilter
      />,
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('mac');
    expect(screen.queryByText('+ 검색어 추가')).not.toBeInTheDocument();
    expect(screen.getByText('검색 중...')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '필터메뉴' }),
    ).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'macallan' } });
    expect(onValueChange).toHaveBeenCalledWith('macallan');
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

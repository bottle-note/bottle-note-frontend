import { render, screen } from '@testing-library/react';
import type { ExploreAlcohol } from '@/types/Explore';
import { ROUTES } from '@/constants/routes';
import ItemInfo from '@/components/feature/List/_components/ItemInfo';
import WhiskeyListItem from './WhiskeyListItem';

jest.mock('@/components/feature/List/_components/ItemImage', () => ({
  __esModule: true,
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

jest.mock('@/components/feature/List/_components/ItemInfo', () => ({
  __esModule: true,
  default: jest.fn(({ korName }: { korName: string }) => <p>{korName}</p>),
}));

jest.mock('@/components/ui/Display/Star', () => ({
  __esModule: true,
  default: () => null,
}));

const mockItemInfo = ItemInfo as jest.Mock;

const createContent = (
  abv: string,
  alcoholsTastingTags: string[] = [],
): ExploreAlcohol => ({
  alcoholId: 1,
  alcoholUrlImg: 'https://example.com/whisky.jpg',
  korName: '글렌피딕 12년',
  engName: 'Glenfiddich 12 Years Old',
  korCategory: '싱글 몰트',
  engCategory: 'Single Malt',
  korRegion: '스코틀랜드',
  engRegion: 'Scotland',
  cask: 'Oak Casks',
  abv,
  korDistillery: '글렌피딕 증류소',
  engDistillery: 'Glenfiddich Distillery',
  rating: 4.2,
  totalRatingsCount: 10,
  myRating: 4,
  myAvgRating: 4,
  isPicked: false,
  alcoholsTastingTags,
});

describe('WhiskeyListItem', () => {
  beforeEach(() => {
    mockItemInfo.mockClear();
  });

  it.each(['40', '40%', '40% %'])(
    '도수 입력값 "%s"을 퍼센트 기호 하나로 표시한다',
    (abv) => {
      render(<WhiskeyListItem content={createContent(abv)} />);

      expect(screen.getByText('도수 40% · 싱글 몰트')).toHaveClass(
        'text-fg-neutral-muted',
      );
    },
  );

  it.each([
    ['', '도수 % · 싱글 몰트'],
    ['N/A', '도수 N/A% · 싱글 몰트'],
  ])('빈 값 또는 비수치 입력값 "%s"의 기존 표시를 유지한다', (abv, text) => {
    render(<WhiskeyListItem content={createContent(abv)} />);

    expect(screen.getByText(text)).toBeInTheDocument();
  });

  it('모든 고유 태그와 위스키 상세 이동 링크를 유지한다', () => {
    const content = createContent('40', [
      '바닐라',
      '오크',
      '바닐라',
      '긴 여운',
      '시트러스',
      '캐러멜',
    ]);

    render(<WhiskeyListItem content={content} />);

    expect(screen.getAllByText('바닐라')).toHaveLength(1);
    ['오크', '긴 여운', '시트러스', '캐러멜'].forEach((tag) => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    const detailLinks = screen.getAllByRole('link');
    expect(detailLinks).toHaveLength(2);
    detailLinks.forEach((link) => {
      expect(link).toHaveAttribute(
        'href',
        ROUTES.SEARCH.ALL(content.alcoholId),
      );
    });
  });

  it('동일한 기존 카드 데이터는 부모가 다시 렌더돼도 다시 렌더하지 않는다', () => {
    const content = createContent('40', ['바닐라', '오크']);
    const { rerender } = render(<WhiskeyListItem content={content} />);
    const initialRenderCount = mockItemInfo.mock.calls.length;

    rerender(<WhiskeyListItem content={content} />);

    expect(mockItemInfo).toHaveBeenCalledTimes(initialRenderCount);
  });
});

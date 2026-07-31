import { render, screen } from '@testing-library/react';
import type { TastingEventAlcohol } from '@/api/curation-v2/types';
import { ROUTES } from '@/constants/routes';
import { TastingEventLineupItem } from './TastingEventLineupItem';

jest.mock('@/components/feature/List/_components/ItemImage', () => ({
  __esModule: true,
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

jest.mock('@/components/feature/List/_components/ItemInfo', () => ({
  __esModule: true,
  default: ({ korName }: { korName: string }) => <p>{korName}</p>,
}));

const createItem = (alcoholId: number | null): TastingEventAlcohol => ({
  alcohol: {
    alcoholId,
    korName: '글렌모렌지 10년',
    engName: 'Glenmorangie 10 Years Old',
    imageUrl: 'https://example.com/glenmorangie.jpg',
    abv: '40',
  },
  stats: {
    rating: 4.2,
    totalRatingsCount: 12,
  },
  comment: '부드러운 시트러스 향',
});

describe('TastingEventLineupItem', () => {
  it('상세 이동 가능한 항목 전체를 단일 Link로 제공하고 상세보기 안내를 노출한다', () => {
    render(<TastingEventLineupItem item={createItem(123)} order={1} />);

    const link = screen.getByRole('link');

    expect(link).toHaveAttribute('href', ROUTES.SEARCH.ALL(123));
    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(screen.getByText('상세보기 >')).toHaveClass('link-button');
    expect(screen.getByText('도수 40%')).toHaveClass('text-fg-neutral');
    expect(screen.getByText('부드러운 시트러스 향')).toHaveClass(
      'text-fg-neutral-muted',
    );
  });

  it('상세 ID가 없는 수동 라인업에는 상세 Link와 상세보기 안내를 노출하지 않는다', () => {
    render(<TastingEventLineupItem item={createItem(null)} order={1} />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByText('상세보기 >')).not.toBeInTheDocument();
  });
});

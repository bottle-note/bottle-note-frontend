import { describe, expect, it } from 'vitest';
import type { Banner } from '@/api/banner/types';
import { filterBannersByDate } from './filterBannersByDate';

const now = new Date('2026-10-07T15:00:00.000Z'); // 2026-10-08 00:00 KST

function banner(
  id: number,
  startDate: string | null,
  endDate: string | null,
): Banner {
  return {
    id,
    name: `banner ${id}`,
    nameFontColor: '#000000',
    descriptionA: '',
    descriptionB: '',
    descriptionFontColor: '#000000',
    imageUrl: '/banner.webp',
    posterUrl: null,
    textPosition: 'CENTER',
    targetUrl: '/test',
    isExternalUrl: false,
    mediaType: 'IMAGE',
    bannerType: 'AD',
    sortOrder: id,
    startDate,
    endDate,
  };
}

describe('홈 배너 노출 기간', () => {
  it('KST 기준 시작 전·만료 후를 제외하고 노출 중·상시 노출을 유지한다', () => {
    const banners = [
      banner(1, '2026-10-08T00:00:01', null), // 시작 전
      banner(2, null, '2026-10-07T23:59:59'), // 만료
      banner(3, '2026-10-07T23:59:59', '2026-10-08T00:00:01'),
      banner(4, null, null),
    ];

    expect(filterBannersByDate(banners, now).map(({ id }) => id)).toEqual([
      3, 4,
    ]);
  });

  it('시작·종료 경계 시각도 포함한다', () => {
    const banners = [
      banner(1, '2026-10-08T00:00:00', null),
      banner(2, null, '2026-10-08T00:00:00'),
      banner(3, '2026-10-08T00:00:00', '2026-10-08T00:00:00'),
    ];

    expect(filterBannersByDate(banners, now).map(({ id }) => id)).toEqual([
      1, 2, 3,
    ]);
  });

  it('파싱할 수 없는 기간은 노출하지 않는다', () => {
    expect(filterBannersByDate([banner(1, null, 'bad')], now)).toEqual([]);
    expect(filterBannersByDate([banner(2, 'bad', null)], now)).toEqual([]);
  });
});

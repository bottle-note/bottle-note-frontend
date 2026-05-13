import type { Region } from '@/queries/useRegionsQuery';

export interface RegionGroup {
  /** 그룹 대표 (부모 항목 또는 단독 국가) */
  parent: Region;
  /** 그룹 표시 이름 (한글) — 부모 korName에서 "/전체" 접미사 제거 */
  displayName: string;
  /** 영문명 */
  engName: string;
  /** 하위 지역 목록 */
  children: Region[];
}

/**
 * BE가 부모 항목 `korName`에 붙여 보내는 `/전체` 접미사를 화면 표시용 이름에서 제거.
 * 백엔드 이슈 bottle-note/workspace#230 해결 시 같이 정리.
 */
const stripParentTotalSuffix = (korName: string): string =>
  korName.replace(/\/전체$/, '');

const bySortOrder = (a: Region, b: Region): number => {
  const ao = a.sortOrder ?? 9999;
  const bo = b.sortOrder ?? 9999;
  if (ao !== bo) return ao - bo;
  return (a.regionId as number) - (b.regionId as number);
};

/**
 * `parentId` 기반으로 flat한 지역 목록을 그루핑합니다.
 *
 * - `parentId == null` 항목 → 부모 또는 단독 국가
 * - `parentId === N` 항목 → 부모 regionId가 N인 그룹의 자식
 * - 자식이 있는 부모는 앞쪽, 단독 국가는 뒤쪽 (각 영역 내부는 sortOrder)
 */
export function groupRegions(regions: Region[]): RegionGroup[] {
  const real = regions.filter((r) => r.regionId !== '');

  const childrenByParentId = new Map<number, Region[]>();
  for (const r of real) {
    if (r.parentId == null) continue;
    const list = childrenByParentId.get(r.parentId) ?? [];
    list.push(r);
    childrenByParentId.set(r.parentId, list);
  }

  const grouped: RegionGroup[] = [];
  const standalones: RegionGroup[] = [];

  for (const r of real) {
    if (r.parentId != null) continue;
    const children = (childrenByParentId.get(r.regionId as number) ?? [])
      .slice()
      .sort(bySortOrder);

    const group: RegionGroup = {
      parent: r,
      displayName: stripParentTotalSuffix(r.korName),
      engName: r.engName,
      children,
    };

    (children.length > 0 ? grouped : standalones).push(group);
  }

  grouped.sort((a, b) => bySortOrder(a.parent, b.parent));
  standalones.sort((a, b) => bySortOrder(a.parent, b.parent));

  return [...grouped, ...standalones];
}

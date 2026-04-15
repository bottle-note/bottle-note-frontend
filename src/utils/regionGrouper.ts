import type { Region } from '@/queries/useRegionsQuery';

export interface RegionGroup {
  /** 그룹 대표 (부모 항목 또는 단독 국가) */
  parent: Region;
  /** 그룹 표시 이름 (한글) */
  displayName: string;
  /** 영문명 */
  engName: string;
  /** 하위 지역 목록 */
  children: Region[];
}

/**
 * engName의 슬래시(/) 유무로 flat한 지역 목록을 그루핑합니다.
 *
 * - engName에 슬래시 없는 항목 중, 같은 이름을 접두사로 가진 하위 항목이 있으면 → 부모
 * - engName에 슬래시 있는 항목 → 접두사가 같은 부모의 자식
 * - 하위 항목이 없는 단독 국가 → children 비어있음
 *
 * 정렬: 하위 지역이 있는 그룹이 앞쪽, 단독 국가가 뒤쪽
 */
export function groupRegions(regions: Region[]): RegionGroup[] {
  const withSlash: Region[] = [];
  const withoutSlash: Region[] = [];

  for (const region of regions) {
    if (region.regionId === '') continue;

    if (region.engName.includes('/')) {
      withSlash.push(region);
    } else {
      withoutSlash.push(region);
    }
  }

  // 슬래시 항목을 engName 접두사로 그루핑
  const childrenByPrefix = new Map<string, Region[]>();
  for (const region of withSlash) {
    const prefix = region.engName.split('/')[0];
    const list = childrenByPrefix.get(prefix) ?? [];
    list.push(region);
    childrenByPrefix.set(prefix, list);
  }

  // 부모-자식 매칭 + 단독 국가 분리
  const groups: RegionGroup[] = [];
  const standalones: RegionGroup[] = [];

  for (const region of withoutSlash) {
    const children = childrenByPrefix.get(region.engName);

    if (children) {
      groups.push({
        parent: region,
        displayName: region.korName,
        engName: region.engName,
        children,
      });
      childrenByPrefix.delete(region.engName);
    } else {
      standalones.push({
        parent: region,
        displayName: region.korName,
        engName: region.engName,
        children: [],
      });
    }
  }

  // 하위 있는 그룹이 앞쪽, 단독 국가가 뒤쪽
  return [...groups, ...standalones];
}

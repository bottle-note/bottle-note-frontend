/**
 * API engName → 국기 이미지 경로 매핑
 * public/flags/ 디렉토리의 정적 에셋 사용
 */

const REGION_FLAG_MAP: Record<string, string> = {
  Australia: '/flags/Australia.svg',
  Finland: '/flags/Finland.svg',
  France: '/flags/France.svg',
  Taiwan: '/flags/Taiwan.svg',
  Canada: '/flags/Canada.svg',
  'Czech Republic': '/flags/Czechia.svg',
  Japan: '/flags/Japan.svg',
  India: '/flags/India.svg',
  Israel: '/flags/Israel.svg',
  Wales: '/flags/Wales.svg',
  Ireland: '/flags/Ireland.svg',
  Iceland: '/flags/Iceland.svg',
  Scotland: '/flags/Scotland.svg',
  Switzerland: '/flags/Swiss.svg',
  Sweden: '/flags/Sweden.svg',
  'United States': '/flags/USA.svg',
  Germany: '/flags/Germany.svg',
  Denmark: '/flags/Denmark.svg',
  Netherlands: '/flags/Netherlands.svg',
  Korea: '/flags/Korea.svg',
  England: '/flags/England.svg',
};

export function getRegionFlagUrl(engName: string): string {
  // 하위 지역이면 슬래시 앞 부모명으로 매핑
  const parentName = engName.split('/')[0];
  return REGION_FLAG_MAP[parentName] ?? '';
}

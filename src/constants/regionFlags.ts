/**
 * API engName → 국기 이미지 경로 매핑
 * public/flags/ 디렉토리의 정적 에셋 사용
 */

const REGION_FLAG_MAP: Record<string, string> = {
  Australia: '/flags/Autstrailia.png',
  Finland: '/flags/Finland.png',
  France: '/flags/France.png',
  Taiwan: '/flags/Taiwan.png',
  Canada: '/flags/Canada.png',
  'Czech Republic': '/flags/Czechia.png',
  Japan: '/flags/Japan.png',
  India: '/flags/India.png',
  Israel: '/flags/Israel.png',
  Wales: '/flags/Wales.png',
  Ireland: '/flags/Ireland.png',
  Iceland: '/flags/Iceland.png',
  Scotland: '/flags/Scotland.png',
  Switzerland: '/flags/Swiss.png',
  Sweden: '/flags/Sweden.png',
  'United States': '/flags/US.png',
  Germany: '/flags/Germany.png',
  Denmark: '/flags/Denmark.png',
  Netherlands: '/flags/Netherlands.png',
  Korea: '/flags/Korea.png',
  England: '/flags/England.png',
};

export function getRegionFlagUrl(engName: string): string {
  // 하위 지역이면 슬래시 앞 부모명으로 매핑
  const parentName = engName.split('/')[0];
  return REGION_FLAG_MAP[parentName] ?? '';
}

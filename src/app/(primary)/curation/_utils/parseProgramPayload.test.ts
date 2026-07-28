import {
  formatProgramDateRange,
  formatProgramFee,
  formatProgramTag,
  formatProgramType,
} from './parseProgramPayload';

describe('PROGRAM display values', () => {
  it('행사 기간과 참가비를 사용자 노출 형식으로 변환한다', () => {
    expect(formatProgramDateRange('2026-07-24', '2026-07-26')).toBe(
      '7월 24일 (금) ~ 7월 26일 (일)',
    );
    expect(formatProgramFee(0)).toBe('무료');
    expect(formatProgramFee(30000)).toBe('30,000원');
    expect(formatProgramFee(null)).toBe('참가비 별도 안내');
  });

  it('계약의 enum을 화면 문구로 변환한다', () => {
    expect(formatProgramType('MASTER_CLASS')).toBe('마스터 클래스');
    expect(formatProgramTag('TRADITIONAL_LIQUOR')).toBe('전통주');
  });
});

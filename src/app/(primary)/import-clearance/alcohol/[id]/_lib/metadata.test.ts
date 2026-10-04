import type { MfdsAlcoholDetail } from '@/api/mfds/types';
import { buildImportClearanceAlcoholMetadata } from './metadata';

const declaration: MfdsAlcoholDetail = {
  id: 123,
  rcno: '2026-123',
  processedDate: '2026-09-10',
  alcoholId: null,
  alcoholNameKo: '스프링뱅크 10년',
  alcoholNameEn: 'Springbank 10',
  baseProductNameKo: '스프링뱅크',
  baseProductNameEn: 'Springbank',
  skuDisplayNameKo: null,
  skuDisplayNameEn: null,
  alcoholCategoryKo: '위스키',
  alcoholCategoryEn: 'Whisky',
  exportCountryAlpha2: 'GB',
  exportCountryNameKo: '영국',
  volumeMl: 700,
  abvPercent: 46,
  importerId: null,
  importerBaseName: null,
  unitVolumeMl: null,
  packageCount: null,
  ageYears: 10,
  vintageYear: null,
  editionName: null,
  caskNumber: null,
  batchNumber: null,
  expiryStart: null,
  expiryEnd: null,
  manufacturerName: null,
  manufactureCountryNameKo: null,
  importer: null,
};

describe('수입 신고 상세 메타데이터', () => {
  it('신고 ID의 URL과 화면에 표시하는 주류명·스펙으로 공유 메타를 만든다', () => {
    const metadata = buildImportClearanceAlcoholMetadata('123', {
      status: 'ok',
      data: declaration,
    });

    expect(metadata.title).toBe('스프링뱅크 10년 수입통관 정보');
    expect(metadata.description).toContain('도수 46% 용량 700ml');
    expect(metadata.alternates?.canonical).toBe(
      '/import-clearance/alcohol/123',
    );
    expect(metadata.openGraph?.url).toBe('/import-clearance/alcohol/123');
    expect(metadata.twitter?.title).toBe('스프링뱅크 10년 수입통관 정보');
  });

  it('존재하지 않는 신고는 색인을 막고 임시 API 오류는 기본 메타를 제공한다', () => {
    const missing = buildImportClearanceAlcoholMetadata('404', {
      status: 'not-found',
    });
    const error = buildImportClearanceAlcoholMetadata('123', {
      status: 'error',
    });

    expect(missing.robots).toEqual({ index: false, follow: false });
    expect(missing.alternates).toBeUndefined();
    expect(error.title).toBe('수입통관 정보');
    expect(error.alternates?.canonical).toBe('/import-clearance/alcohol/123');
  });
});

// ============================================
// MFDS(수입 정보) API - Request/Response Types
// ============================================

import type { InfiniteListParams } from '@/api/_shared/types';

// --------------- Request Types ---------------

export type MfdsAlcoholListParams = InfiniteListParams & {
  /** BottleNote 주류 한글명 정확 일치 */
  alcoholNameKo?: string;
  /** 매칭이 확정된 신고만 조회 */
  alcoholId?: number;
  importerId?: number;
  /** ISO 3166-1 Alpha-2 */
  exportCountry?: string;
  /** 원장 카테고리 한글명 정확 일치. 후보는 GET /mfds/alcohols/category */
  alcoholCategoryKo?: string;
  /** YYYY-MM-DD */
  processedDateFrom?: string;
  /** YYYY-MM-DD */
  processedDateTo?: string;
  keyword?: string;
  signal?: AbortSignal;
};

export type MfdsImporterListParams = InfiniteListParams & {
  keyword?: string;
  signal?: AbortSignal;
};

// --------------- Response Types ---------------

/** 원장에 등장한 수출국. alpha2를 exportCountry 파라미터에 그대로 사용한다. */
export interface MfdsCountry {
  alpha2: string;
  nameKo: string | null;
  nameEn: string | null;
}

/** 원장에 등장한 카테고리. alcoholCategoryKo를 같은 이름의 파라미터에 그대로 사용한다. */
export interface MfdsAlcoholCategory {
  alcoholCategoryKo: string | null;
  alcoholCategoryEn: string | null;
  /** 해당 카테고리의 공개 건수 */
  count: number;
}

export interface MfdsImporter {
  id: number;
  officialBusinessCode: string | null;
  licenseNo: string | null;
  businessName: string | null;
  representativeName: string | null;
  permitDate: string | null;
  institutionName: string | null;
  primaryAddress: string | null;
  telephoneNo: string | null;
  industryName: string | null;
  operatingStatus: string | null;
  description: string | null;
}

export interface MfdsAlcoholListItem {
  /** 수입 신고 레코드 ID. BottleNote 주류 ID가 아니다. */
  id: number;
  /** 수입신고번호 */
  rcno: string | null;
  /** 수집 사이트 기준 처리일자. YYYY-MM-DD 또는 null. */
  processedDate: string | null;
  /** 매칭이 확정된 경우에만 채워진다. */
  alcoholId: number | null;
  alcoholNameKo: string | null;
  alcoholNameEn: string | null;
  baseProductNameKo: string | null;
  baseProductNameEn: string | null;
  skuDisplayNameKo: string | null;
  skuDisplayNameEn: string | null;
  alcoholCategoryKo: string | null;
  alcoholCategoryEn: string | null;
  ageYears: number | null;
  distilleryLinked: boolean;
  regionLinked: boolean;
  exportCountryAlpha2: string | null;
  exportCountryNameKo: string | null;
  volumeMl: number | null;
  abvPercent: number | null;
  importerId: number | null;
  importerBaseName: string | null;
}

export interface MfdsAlcoholDetail {
  id: number;
  rcno: string | null;
  processedDate: string | null;
  alcoholId: number | null;
  alcoholNameKo: string | null;
  alcoholNameEn: string | null;
  baseProductNameKo: string | null;
  baseProductNameEn: string | null;
  skuDisplayNameKo: string | null;
  skuDisplayNameEn: string | null;
  alcoholCategoryKo: string | null;
  alcoholCategoryEn: string | null;
  exportCountryAlpha2: string | null;
  exportCountryNameKo: string | null;
  volumeMl: number | null;
  abvPercent: number | null;
  importerId: number | null;
  importerBaseName: string | null;
  unitVolumeMl: number | null;
  packageCount: number | null;
  ageYears: number | null;
  vintageYear: number | null;
  editionName: string | null;
  caskNumber: string | null;
  batchNumber: string | null;
  expiryStart: string | null;
  expiryEnd: string | null;
  manufacturerName: string | null;
  manufactureCountryNameKo: string | null;
  /** 노출 대상 수입사가 연결된 경우에만 채워진다. */
  importer: MfdsImporter | null;
}

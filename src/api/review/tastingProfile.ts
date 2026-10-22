import {
  TASTING_AXES,
  TASTING_MAX_VALUE,
  type TastingAxisKey,
} from '@/constants/tastingNote';
import type { FormValues } from '@/types/Review';
import type { ReviewTastingProfile } from './types';

export type TastingProfileAxis = ReviewTastingProfile['axes'][number];

const PROFILE_VERSION = 1;

/** 레이더 차트로 그릴 수 있는 최소 항목 수와 한 리뷰에서 편집할 최대 항목 수 */
export const TASTING_AXIS_MIN_COUNT = 3;
export const TASTING_AXIS_MAX_COUNT = 8;
/** 서버 검증과 같은 기준: 앞뒤 공백을 제외한 1~10자 */
export const TASTING_AXIS_NAME_MAX_LENGTH = 10;

const DEFAULT_SLIDER_HINT = ['없음', '강함'] as const;

/** 예전에 테이스팅 PNG를 저장하던 전용 S3 경로. 일반 리뷰 사진과 구별한다. */
export const isLegacyTastingGraphImage = (url: string): boolean =>
  /(?:^|\/)tasting-graph(?:\/|$)/.test(url);

const findDefaultAxis = (axis: TastingProfileAxis) =>
  TASTING_AXES.find(
    (item) => item.key.toUpperCase() === axis.code?.toUpperCase(),
  );

export function createDefaultTastingProfile(): ReviewTastingProfile {
  return {
    version: PROFILE_VERSION,
    maxScore: TASTING_MAX_VALUE,
    axes: TASTING_AXES.map((axis) => ({
      code: axis.key.toUpperCase(),
      name: axis.labelKo,
      description: axis.descriptor,
      score: 0,
    })),
  };
}

/** 기본 6항목·5점 구성(점수는 무관)인지 판별한다. */
export function isDefaultTastingProfile(
  profile: ReviewTastingProfile | null | undefined,
): boolean {
  if (!profile) return true;
  return (
    profile.maxScore === TASTING_MAX_VALUE &&
    profile.axes.length === TASTING_AXES.length &&
    profile.axes.every(
      (axis, index) =>
        axis.code?.toUpperCase() === TASTING_AXES[index].key.toUpperCase() &&
        axis.name === TASTING_AXES[index].labelKo,
    )
  );
}

export function isTastingProfileEmpty(
  profile: ReviewTastingProfile | null | undefined,
): boolean {
  return !profile || profile.axes.every((axis) => axis.score === 0);
}

/** 모든 점수가 0이면 기록이 없는 것으로 보고 null을 보낸다. 서버도 같은 규칙으로 정규화한다. */
export function toSubmitTastingProfile(
  profile: ReviewTastingProfile | null | undefined,
): ReviewTastingProfile | null {
  return isTastingProfileEmpty(profile) ? null : profile ?? null;
}

export function getTastingAxisHints(
  axis: TastingProfileAxis,
): readonly [string, string] {
  return findDefaultAxis(axis)?.sliderHint ?? DEFAULT_SLIDER_HINT;
}

/** 이 리뷰의 플레이버 태그와 주류 태그 중 항목 이름으로 쓸 수 있는 후보를 고른다. */
export function buildTastingAxisSuggestions(
  sources: (string[] | null | undefined)[],
  existingNames: string[],
  limit = 8,
): string[] {
  const used = new Set(existingNames.map((name) => name.trim()));
  const suggestions: string[] = [];
  sources.flat().forEach((tag) => {
    const name = tag?.trim();
    if (
      !name ||
      name.length > TASTING_AXIS_NAME_MAX_LENGTH ||
      used.has(name) ||
      suggestions.includes(name)
    ) {
      return;
    }
    suggestions.push(name);
  });
  return suggestions.slice(0, limit);
}

type LegacyTastingNote = Partial<Record<TastingAxisKey, number>>;
type SavedReviewContent = FormValues & {
  tastingNote?: LegacyTastingNote | null;
};

/** 6개 점수 객체로 임시저장된 예전 리뷰 작성 데이터를 프로필 형태로 복원한다. */
export function restoreSavedReviewContent(
  content: SavedReviewContent,
): FormValues {
  const { tastingNote, ...rest } = content;
  if (rest.tastingProfile !== undefined || !tastingNote) {
    return { ...rest, tastingProfile: rest.tastingProfile ?? null };
  }

  const profile = createDefaultTastingProfile();
  profile.axes = profile.axes.map((axis, index) => {
    const score = tastingNote[TASTING_AXES[index].key];
    return Number.isInteger(score) &&
      (score as number) >= 0 &&
      (score as number) <= TASTING_MAX_VALUE
      ? { ...axis, score: score as number }
      : axis;
  });
  return {
    ...rest,
    tastingProfile: isTastingProfileEmpty(profile) ? null : profile,
  };
}

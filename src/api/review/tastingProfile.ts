import {
  TASTING_AXES,
  TASTING_MAX_VALUE,
  DEFAULT_TASTING_NOTE,
  isTastingNoteEmpty,
  type TastingNoteValues,
} from '@/constants/tastingNote';
import type { ReviewTastingProfile } from './types';

const PROFILE_VERSION = 1;

export function toReviewTastingProfile(
  note: TastingNoteValues | null | undefined,
): ReviewTastingProfile | null {
  if (!note || isTastingNoteEmpty(note)) return null;

  return {
    version: PROFILE_VERSION,
    maxScore: TASTING_MAX_VALUE,
    axes: TASTING_AXES.map((axis) => ({
      code: axis.key.toUpperCase(),
      name: axis.labelKo,
      description: axis.descriptor,
      score: note[axis.key],
    })),
  };
}

export function fromReviewTastingProfile(
  profile: ReviewTastingProfile | null | undefined,
): TastingNoteValues | null {
  if (
    !profile ||
    profile.version !== PROFILE_VERSION ||
    profile.maxScore !== TASTING_MAX_VALUE ||
    profile.axes?.length !== TASTING_AXES.length
  ) {
    return null;
  }

  const values: TastingNoteValues = { ...DEFAULT_TASTING_NOTE };
  for (const axis of TASTING_AXES) {
    const matches = profile.axes.filter(
      (item) => item.code?.toUpperCase() === axis.key.toUpperCase(),
    );
    if (matches.length !== 1) return null;
    const score = matches[0].score;
    if (!Number.isInteger(score) || score < 0 || score > TASTING_MAX_VALUE) {
      return null;
    }
    values[axis.key] = score;
  }

  return values;
}

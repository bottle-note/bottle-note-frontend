import {
  TASTING_MAX_VALUE,
  getTastingHapticType,
} from '@/constants/tastingNote';
import { handleWebViewMessage } from '@/utils/flutterUtil';

export function triggerTastingHaptic(
  value: number,
  maxScore: number = TASTING_MAX_VALUE,
) {
  const type = getTastingHapticType(value, maxScore);
  if (type) handleWebViewMessage('triggerHaptic', { type });
}

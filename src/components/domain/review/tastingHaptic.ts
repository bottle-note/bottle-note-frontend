import {
  TASTING_MAX_VALUE,
  getTastingHapticType,
} from '@/constants/tastingNote';
import { handleWebViewMessage } from '@/utils/flutterUtil';

/**
 * 테이스팅 점수가 바뀌었을 때 점수 단계에 맞는 햅틱을 앱에 보낸다.
 * 0점이면 보내지 않고, 브라우저에서는 handleWebViewMessage가 아무것도 하지 않는다.
 */
export function triggerTastingHaptic(
  value: number,
  maxScore: number = TASTING_MAX_VALUE,
) {
  const type = getTastingHapticType(value, maxScore);
  if (type) handleWebViewMessage('triggerHaptic', { type });
}

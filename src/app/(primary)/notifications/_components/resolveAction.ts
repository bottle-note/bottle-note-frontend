import type { NotificationAction } from '@/api/notification/types';
import { ROUTES } from '@/constants/routes';

export type NotificationDestination = {
  href: string;
  type: 'review' | 'user' | 'help';
  targetId: number;
};

export function resolveNotificationAction(
  action: NotificationAction | null,
): NotificationDestination | null {
  if (
    !action ||
    !Number.isSafeInteger(action.targetId) ||
    action.targetId <= 0
  ) {
    return null;
  }

  switch (`${action.type}:${action.version}`) {
    case 'OPEN_REVIEW:1':
      if (
        !action.payload ||
        !Number.isSafeInteger(action.payload.replyId) ||
        Number(action.payload.replyId) <= 0
      ) {
        return null;
      }
      return {
        href: `${ROUTES.REVIEW.DETAIL(action.targetId)}?scrollTo=replies`,
        type: 'review',
        targetId: action.targetId,
      };
    case 'OPEN_REVIEW:2':
      return {
        href: ROUTES.REVIEW.DETAIL(action.targetId),
        type: 'review',
        targetId: action.targetId,
      };
    case 'OPEN_USER:1':
      return {
        href: ROUTES.USER.BASE(action.targetId),
        type: 'user',
        targetId: action.targetId,
      };
    case 'OPEN_HELP:1':
      return {
        href: `${ROUTES.INQUIRE.BASE}/${action.targetId}`,
        type: 'help',
        targetId: action.targetId,
      };
    default:
      return null;
  }
}

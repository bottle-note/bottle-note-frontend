import {
  Bell,
  CalendarDays,
  FileText,
  Heart,
  MessageCircle,
  UserRoundPlus,
  Wine,
} from 'lucide-react';

const iconByEventAction: Record<string, typeof Bell> = {
  REVIEW_COMMENT_CREATE: MessageCircle,
  REVIEW_REPLY_CREATE: MessageCircle,
  REVIEW_LIKE_ADD: Heart,
  FOLLOW_CREATE: UserRoundPlus,
  FOLLOWING_REVIEW_CREATE: FileText,
  REVIEW_FEATURE_SELECT: Wine,
  TASTING_OPEN: Wine,
  TASTING_UPDATE: Wine,
  PROGRAM_OPEN: CalendarDays,
  PROGRAM_UPDATE: CalendarDays,
  PROGRAM_RESULT_ANNOUNCE: CalendarDays,
  NOTICE_PUBLISH: Bell,
  CAMPAIGN_OPEN: Bell,
  HELP_ANSWER_CREATE: MessageCircle,
  REPORT_RESULT_ANNOUNCE: FileText,
  CONTENT_MODERATE: FileText,
  ACCOUNT_STATUS_UPDATE: Bell,
  ALCOHOL_SUBMISSION_REVIEW: Wine,
};

const iconByGroup: Record<string, typeof Bell> = {
  REVIEW_AND_FOLLOW: MessageCircle,
  TASTING: Wine,
  PROGRAM: CalendarDays,
  NOTICE_AND_EVENT: Bell,
  MY_ACTIVITY: FileText,
};

export function NotificationIcon({
  eventAction,
  group,
}: {
  eventAction: string | null;
  group: string | null;
}) {
  const Icon =
    (eventAction && iconByEventAction[eventAction]) ||
    (group && iconByGroup[group]) ||
    Bell;

  return (
    <span className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-bg-brand-weak text-fg-brand">
      <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
    </span>
  );
}

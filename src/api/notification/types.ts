export interface NotificationSetting {
  eventAction: string;
  displayName: string;
  description: string | null;
  defaultEnabled: boolean;
  enabled: boolean;
}

export interface NotificationSettingsGroup {
  group: string;
  displayName: string;
  settings: NotificationSetting[];
}

export interface NotificationSettingsData {
  groups: NotificationSettingsGroup[];
}

export interface NotificationSettingsUpdateRequest {
  settings: { eventAction: string; enabled: boolean }[];
}

export interface NotificationAction {
  type: string;
  targetId: number;
  payload: Record<string, unknown> | null;
  version: number;
  fallbackType: string | null;
}

export interface NotificationItem {
  id: number;
  title: string;
  content: string;
  eventAction: string | null;
  group: string | null;
  status: string;
  isRead: boolean;
  createAt: string;
  readAt: string | null;
  action: NotificationAction | null;
}

export interface NotificationListData {
  items: NotificationItem[];
}

export interface NotificationUnreadCountData {
  unreadCount: number;
}

export interface NotificationMarkReadData {
  notificationId: number;
  isRead: boolean;
  readAt: string | null;
  changed: boolean;
  unreadCount: number;
}

export interface NotificationMarkAllReadData {
  updatedCount: number;
}

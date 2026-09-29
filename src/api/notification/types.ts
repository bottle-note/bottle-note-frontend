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

export type ScreenType = 'main' | 'loginManagement' | 'blockManagement';

export interface MenuItem {
  text: string;
  action?: () => void;
  link?: string;
}

export interface ScreenConfig {
  title: string;
  items?: MenuItem[];
  component?: React.ComponentType;
}

export interface MenuCategory {
  title: string;
  items: MenuItem[];
}

export interface BlockListApi {
  totalCount: number;
  items: {
    userId: string;
    userName: string;
    blockedAt: string;
  }[];
}

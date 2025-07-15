export type ScreenType = 'main' | 'loginManagement' | 'inquiryManagement' | 'blockManagement';

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

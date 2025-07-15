export type ScreenType = 'main' | 'loginManagement' | 'inquiryManagement';

export interface MenuItem {
  text: string;
  action?: () => void;
  link?: string;
}

export interface ScreenConfig {
  title: string;
  items: MenuItem[];
}

export interface MenuCategory {
  title: string;
  items: MenuItem[];
}

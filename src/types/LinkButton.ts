import { StaticImageData } from 'next/image';

export interface LinkData {
  listType?: 'Full' | 'Half';
  engName: string;
  korName: string;
  linkSrc: string | { pathname: string; query?: any };
  imgSrc?: StaticImageData;
  imageSize?: { width: number; height: number };
  icon?: boolean;
  handleBeforeRouteChange?: (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => void;
}

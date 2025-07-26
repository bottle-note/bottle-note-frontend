import { ScreenConfig, MenuCategory, ScreenType } from '@/types/Settings';
import BlockManagement from './_components/BlockManagement';

export const createScreenConfigs = (
  handleLogout: () => void,
  handleDeleteAccount: () => void,
  onRouteNavigate: (path: string) => void,
): Record<string, ScreenConfig> => ({
  loginManagement: {
    title: '로그인관리',
    items: [
      {
        text: '로그아웃',
        action: handleLogout,
      },
      {
        text: '서비스 탈퇴',
        action: handleDeleteAccount,
      },
    ],
  },
  inquiryManagement: {
    title: '문의 관리',
    items: [
      {
        text: '문의 내역 조회',
        action: () => onRouteNavigate('/inquire'),
      },
      {
        text: '문의하기',
        action: () => onRouteNavigate('/inquire/register'),
      },
    ],
  },
  blockManagement: {
    title: '차단 사용자 관리',
    component: BlockManagement,
  },
});

export const createMenuCategories = (
  onScreenNavigate: (screen: ScreenType) => void,
  onRouteNavigate: (path: string) => void,
  handleSwitchEnv?: () => void,
): MenuCategory[] => [
  {
    title: '내 정보',
    items: [
      {
        text: '내 정보',
        action: () => onScreenNavigate('inquiryManagement'),
      },
      {
        text: '차단 사용자 관리',
        action: () => onScreenNavigate('blockManagement'),
      },
    ],
  },
  {
    title: '문의 관리',
    items: [
      {
        text: '서비스 문의',
        action: () => onScreenNavigate('inquiryManagement'),
      },
      {
        text: '비즈니스 문의',
        action: () => onRouteNavigate('/business-inquiry'),
      },
    ],
  },
  {
    title: '기타',
    items: [
      {
        text: '공지사항',
        link: `${process.env.NEXT_PUBLIC_BOTTLE_NOTE_NOTION_URL}board?pvs=4`,
        action: undefined,
      },
      {
        text: '개인정보 처리방침',
        link: `${process.env.NEXT_PUBLIC_BOTTLE_NOTE_NOTION_URL}`,
        action: undefined,
      },
      {
        text: '이용약관',
        link: `${process.env.NEXT_PUBLIC_BOTTLE_NOTE_NOTION_URL}info?pvs=4`,
        action: undefined,
      },
      {
        text: '로그인 관리',
        action: () => onScreenNavigate('loginManagement'),
      },
    ],
  },
  {
    title: '관리자 메뉴',
    items: [
      {
        text: '개발환경변경',
        action: handleSwitchEnv,
      },
      // {
      //   text: '위스키 정보 관리',
      //   action: undefined,
      // },
      // {
      //   text: '문의 관리',
      //   action: undefined,
      // },
      // {
      //   text: '신고 관리',
      //   action: undefined,
      // },
      // {
      //   text: '유저 관리',
      //   action: undefined,
      // },
    ],
  },
];

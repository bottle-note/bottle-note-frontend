import { ScreenConfig, MenuCategory, ScreenType } from '@/types/Settings';
import { ROUTES } from '@/constants/routes';
import BlockManagement from './_components/BlockManagement';
import ThemeSettings from './_components/ThemeSettings';

interface CreateScreenConfigsParams {
  isLoggedIn: boolean;
  handleLogin: () => void;
  handleLogout: () => void;
  handleDeleteAccount: () => void;
}

export const createScreenConfigs = ({
  isLoggedIn,
  handleLogin,
  handleLogout,
  handleDeleteAccount,
}: CreateScreenConfigsParams): Record<
  Exclude<ScreenType, 'main'>,
  ScreenConfig
> => ({
  themeSettings: {
    title: '화면 테마',
    component: ThemeSettings,
  },
  loginManagement: {
    title: '로그인관리',
    items: isLoggedIn
      ? [
          {
            text: '로그아웃',
            action: handleLogout,
          },
          {
            text: '서비스 탈퇴',
            action: handleDeleteAccount,
          },
        ]
      : [
          {
            text: '로그인',
            action: handleLogin,
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
  onAuthRouteNavigate: (path: string) => void,
  handleSwitchEnv?: () => void,
  userId?: string | number,
  isAdmin?: boolean,
  isLoggedIn = false,
): MenuCategory[] => {
  const publicItems = [
    {
      text: '화면 테마',
      action: () => onScreenNavigate('themeSettings'),
    },
    {
      text: '로그인 관리',
      action: () => onScreenNavigate('loginManagement'),
    },
  ];

  if (!isLoggedIn) {
    return [
      {
        title: '기타',
        items: publicItems,
      },
    ];
  }

  const baseCategories: MenuCategory[] = [
    {
      title: '내 정보',
      items: [
        {
          text: '내 정보',
          action: () => onAuthRouteNavigate(ROUTES.USER.EDIT(userId!)),
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
          action: () =>
            onAuthRouteNavigate(`${ROUTES.INQUIRE.BASE}?type=service`),
        },
        {
          text: '비즈니스 문의',
          action: () =>
            onAuthRouteNavigate(`${ROUTES.INQUIRE.BASE}?type=business`),
        },
      ],
    },
    {
      title: '기타',
      items: [
        {
          text: '개인정보 처리방침',
          link: ROUTES.LEGAL.PRIVACY_POLICY,
          action: undefined,
        },
        {
          text: '이용약관',
          link: ROUTES.LEGAL.TERMS,
          action: undefined,
        },
        {
          text: '마케팅 정보 수신 동의',
          link: ROUTES.SETTINGS.MARKETING_CONSENT,
          action: undefined,
        },
        ...publicItems,
      ],
    },
  ];

  if (isAdmin) {
    baseCategories.push({
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
    });
  }

  return baseCategories;
};

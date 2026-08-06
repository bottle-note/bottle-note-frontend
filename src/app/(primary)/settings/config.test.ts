import { createMenuCategories, createScreenConfigs } from './config';

describe('settings menu config', () => {
  it('화면 테마 메뉴는 라우트 대신 설정 하위 화면을 연다', () => {
    const navigateToScreen = jest.fn();
    const categories = createMenuCategories(
      navigateToScreen,
      jest.fn(),
      undefined,
      undefined,
      false,
      false,
    );
    const themeMenu = categories
      .flatMap((category) => category.items)
      .find((item) => item.text === '화면 테마');

    expect(themeMenu?.link).toBeUndefined();

    themeMenu?.action?.();

    expect(navigateToScreen).toHaveBeenCalledWith('themeSettings');
  });

  it('비로그인 상태에서는 화면 테마와 로그인 관리 메뉴만 제공한다', () => {
    const categories = createMenuCategories(
      jest.fn(),
      jest.fn(),
      undefined,
      undefined,
      false,
      false,
    );

    expect(
      categories.flatMap((category) => category.items.map((item) => item.text)),
    ).toEqual(['화면 테마', '로그인 관리']);
  });

  it('로그인 상태에서는 전체 설정 메뉴를 제공한다', () => {
    const categories = createMenuCategories(
      jest.fn(),
      jest.fn(),
      undefined,
      1,
      false,
      true,
    );
    const menuTexts = categories.flatMap((category) =>
      category.items.map((item) => item.text),
    );

    expect(menuTexts).toEqual(
      expect.arrayContaining([
        '내 정보',
        '차단 사용자 관리',
        '서비스 문의',
        '비즈니스 문의',
        '화면 테마',
        '로그인 관리',
      ]),
    );
    expect(menuTexts).not.toContain('공지사항');
  });

  it('로그인 상태에서 마케팅 정보 수신 동의 관리 화면으로 이동할 수 있다', () => {
    const categories = createMenuCategories(
      jest.fn(),
      jest.fn(),
      undefined,
      1,
      false,
      true,
    );
    const marketingConsentMenu = categories
      .flatMap((category) => category.items)
      .find((item) => item.text === '마케팅 정보 수신 동의');

    expect(marketingConsentMenu).toMatchObject({
      link: '/settings/marketing-consent',
      action: undefined,
    });
  });

  it('비로그인 상태의 로그인 관리에는 로그인 항목만 제공한다', () => {
    const handleLogin = jest.fn();
    const configs = createScreenConfigs({
      isLoggedIn: false,
      handleLogin,
      handleLogout: jest.fn(),
      handleDeleteAccount: jest.fn(),
    });

    expect(configs.loginManagement.items?.map((item) => item.text)).toEqual([
      '로그인',
    ]);

    configs.loginManagement.items?.[0].action?.();

    expect(handleLogin).toHaveBeenCalledTimes(1);
  });

  it('로그인 상태의 로그인 관리에는 로그아웃과 탈퇴 항목을 제공한다', () => {
    const configs = createScreenConfigs({
      isLoggedIn: true,
      handleLogin: jest.fn(),
      handleLogout: jest.fn(),
      handleDeleteAccount: jest.fn(),
    });

    expect(configs.loginManagement.items?.map((item) => item.text)).toEqual([
      '로그아웃',
      '서비스 탈퇴',
    ]);
  });
});

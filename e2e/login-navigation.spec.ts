import { expect, test, type Page } from '@playwright/test';

async function enterLogin(page: Page, returnTo?: string) {
  await page.goto('/settings');
  if (returnTo) {
    await page.goto(`/login?${new URLSearchParams({ returnTo })}`);
  } else {
    await page
      .getByRole('button', { name: '로그인 관리', exact: true })
      .click();
    await page.getByRole('button', { name: '로그인', exact: true }).click();
  }
  await expect(page).toHaveURL(/\/login\?returnTo=/);
  await expect(
    page.getByRole('button', { name: /카카오 로그인/ }),
  ).toBeVisible();
}

async function showKakaoAuthorizationPage(page: Page) {
  // 실제 SDK가 생성한 외부 인증 요청만 정적 화면으로 받는다. 인증은 수행하지 않는다.
  await page.route('https://kauth.kakao.com/**', (route) =>
    route.fulfill({
      contentType: 'text/html; charset=utf-8',
      body: '<h1>외부 카카오 인증</h1>',
    }),
  );
}

async function getBrowserHistoryPaths(page: Page) {
  const devtools = await page.context().newCDPSession(page);
  const { entries } = await devtools.send('Page.getNavigationHistory');
  await devtools.detach();
  return entries.map((entry) => new URL(entry.url).pathname);
}

async function expectHomeScreen(page: Page) {
  await expect(page).toHaveURL(new URL('/', page.url()).href);
  await expect(
    page.getByRole('heading', { name: '나를 닮은 위스키 MBTI' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: /카카오 로그인/ })).toHaveCount(
    0,
  );
}

test('로그인을 취소하면 진입했던 설정 화면으로 돌아간다', async ({ page }) => {
  await enterLogin(page);
  await page.getByRole('button', { name: 'arrowIcon', exact: true }).click();
  await expect(page).toHaveURL(/\/settings$/);
  await expect(
    page.getByRole('button', { name: '로그인', exact: true }),
  ).toBeVisible();
});

test('잘못된 콜백 이후 비로그인 사용자는 돌아와서 로그인을 다시 시도할 수 있다', async ({
  page,
}) => {
  await enterLogin(page);
  await page.goto('/oauth/kakao?error=access_denied');
  await expect(page).toHaveURL(/\/error$/);

  await page.goBack();
  await expect(page).toHaveURL(/\/login\?returnTo=/);
  await expect(
    page.getByRole('button', { name: /카카오 로그인/ }),
  ).toBeVisible();
});

test('웹 카카오로 나갈 때 로그인 기록을 returnTo로 교체하고 외부 기록을 유지한다', async ({
  page,
}) => {
  await showKakaoAuthorizationPage(page);
  await enterLogin(page);
  await page.getByRole('button', { name: /카카오 로그인/ }).click();
  await expect(
    page.getByRole('heading', { name: '외부 카카오 인증' }),
  ).toBeVisible();

  expect(await getBrowserHistoryPaths(page)).not.toContain('/login');
  expect((await getBrowserHistoryPaths(page)).slice(-2)).toEqual([
    '/',
    '/oauth/authorize',
  ]);

  await page.goBack();
  await expectHomeScreen(page);
});

test('웹 카카오 실패 콜백 후에도 로그인 기록 없이 returnTo로 돌아간다', async ({
  page,
}) => {
  await enterLogin(page);
  const callback = new URL('/oauth/kakao', page.url());
  await page.route('https://kauth.kakao.com/**', (route) => {
    const request = new URL(route.request().url());
    callback.searchParams.set('state', request.searchParams.get('state') ?? '');
    callback.searchParams.set('error', 'access_denied');
    return route.fulfill({ status: 302, headers: { Location: callback.href } });
  });

  await page.getByRole('button', { name: /카카오 로그인/ }).click();
  await expect(page).toHaveURL(/\/error$/);

  expect(await getBrowserHistoryPaths(page)).not.toContain('/login');

  await page.goBack();
  await expectHomeScreen(page);
  await page.goForward();
  await expect(page).toHaveURL(/\/error$/);
});

test('Navigation API 없이도 로그인 기록을 returnTo로 교체한다', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'navigation', { value: undefined });
  });
  await showKakaoAuthorizationPage(page);
  await enterLogin(page);
  await page.getByRole('button', { name: /카카오 로그인/ }).click();
  await expect(
    page.getByRole('heading', { name: '외부 카카오 인증' }),
  ).toBeVisible();

  expect(await getBrowserHistoryPaths(page)).not.toContain('/login');

  await page.goBack();
  await expectHomeScreen(page);
});

test('returnTo의 쿼리와 해시를 보존하고 해당 화면을 실제로 복원한다', async ({
  page,
}) => {
  const returnTo = '/settings?source=login#account';
  await showKakaoAuthorizationPage(page);
  await enterLogin(page, returnTo);
  await page.getByRole('button', { name: /카카오 로그인/ }).click();
  await expect(
    page.getByRole('heading', { name: '외부 카카오 인증' }),
  ).toBeVisible();

  const state = new URLSearchParams(
    new URL(page.url()).searchParams.get('state') ?? '',
  );
  expect(state.get('returnTo')).toBe(returnTo);
  expect(await getBrowserHistoryPaths(page)).not.toContain('/login');

  await page.goBack();
  await expect(page).toHaveURL(new URL(returnTo, page.url()).href);
  await expect(
    page.getByRole('button', { name: '로그인 관리', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: /카카오 로그인/ })).toHaveCount(
    0,
  );
});

test('SDK를 불러오지 못하면 returnTo 교체 전에 로그인 실패를 처리한다', async ({
  page,
}) => {
  await page.route('https://t1.kakaocdn.net/kakao_js_sdk/**', (route) =>
    route.abort(),
  );
  await enterLogin(page);
  await page.getByRole('button', { name: /카카오 로그인/ }).click();
  await expect(page).toHaveURL(/\/error$/);
  expect((await getBrowserHistoryPaths(page)).slice(-2)).toEqual([
    '/settings',
    '/error',
  ]);
});

test.describe('iOS 모바일 웹 SDK 경로', () => {
  test.use({
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 26_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1',
  });

  test('카카오톡 연결 URL로 나갈 때도 로그인 기록을 교체한다', async ({
    page,
  }) => {
    await showKakaoAuthorizationPage(page);
    await enterLogin(page);
    await page.getByRole('button', { name: /카카오 로그인/ }).click();
    await expect(
      page.getByRole('heading', { name: '외부 카카오 인증' }),
    ).toBeVisible();
    expect(await getBrowserHistoryPaths(page)).not.toContain('/login');

    await page.goBack();
    await expectHomeScreen(page);
  });
});

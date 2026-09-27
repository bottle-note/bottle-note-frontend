import { expect, test, type Page } from '@playwright/test';
import type { AgreementStatusResponse } from '@/api/agreement/types';
import type { ClientSession } from '@/lib/auth/session-store';

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

async function completeMbtiQuiz(page: Page) {
  await page.goto('/whiskey-mbti');
  await page
    .getByRole('button', { name: '테스트 시작하기', exact: true })
    .click();
  for (let i = 0; i < 20; i += 1) {
    await page
      .getByRole('button')
      .filter({ has: page.locator('b', { hasText: /^A$/ }) })
      .click();
    if (i < 19) {
      await expect(
        page.locator('p').filter({
          has: page.locator('span', {
            hasText: new RegExp(`^${String(i + 2).padStart(2, '0')}$`),
          }),
        }),
      ).toBeVisible();
    } else {
      await expect(
        page.getByRole('button', { name: '결과 보기', exact: true }),
      ).toBeVisible();
    }
  }
}

for (const agreementRequired of [false, true]) {
  test(`MBTI 결과가 웹 카카오 ${agreementRequired ? '신규가입·약관 동의' : '기존 회원 로그인'} 후 유지된다`, async ({
    page,
  }) => {
    test.setTimeout(90_000);
    // 인증 응답만 주입하고 질문 응답·결과 계산·SDK·복귀 화면은 실제 흐름으로 확인한다.
    const session: ClientSession = {
      accessToken: 'e2e-access-token',
      user: {
        userId: 1,
        sub: 'e2e@bottle-note.com',
        profile: null,
        roles: 'ROLE_USER',
      },
    };
    let loggedIn = false;
    await page.route('**/api/auth/session', (route) =>
      route.fulfill({
        status: loggedIn ? 200 : 401,
        json: loggedIn ? session : { message: 'No refresh token' },
      }),
    );
    await page.route('**/api/auth/login', (route) => {
      loggedIn = true;
      return route.fulfill({ json: { ...session, agreementRequired } });
    });
    await page.route('**/bottle-api/v1/blocks/ids', (route) =>
      route.fulfill({ json: { errors: [], data: [] } }),
    );
    const status: AgreementStatusResponse = {
      eligible: false,
      items: [
        { type: 'TERMS_OF_SERVICE', required: true, agreed: false },
        { type: 'PRIVACY_COLLECTION_USE', required: true, agreed: false },
        { type: 'MARKETING', required: false, agreed: false },
      ],
    };
    await page.route('**/bottle-api/v2/agreements/status', (route) =>
      route.fulfill({ json: { errors: [], data: status } }),
    );
    await page.route('**/bottle-api/v2/agreements', (route) =>
      route.fulfill({
        json: {
          errors: [],
          data: {
            ...status,
            eligible: true,
            items: status.items.map((item) => ({
              ...item,
              agreed: item.required,
            })),
          },
        },
      }),
    );
    await completeMbtiQuiz(page);
    await expect(page).toHaveURL(/\/whiskey-mbti\?result=ESTJ-A$/);
    await page.reload();
    await expect(
      page.getByRole('button', { name: '결과 보기', exact: true }),
    ).toBeVisible();
    await expect(page.getByText('ESTJ-A', { exact: false })).toHaveCount(0);
    await page.getByRole('button', { name: '결과 보기', exact: true }).click();
    await page
      .getByRole('button', { name: '다음에 할게요', exact: true })
      .click();
    await expect(page).toHaveURL(/\/whiskey-mbti\?result=ESTJ-A$/);
    await page.getByRole('button', { name: '결과 보기', exact: true }).click();
    await page.getByRole('button', { name: '로그인', exact: true }).click();
    await expect(page).toHaveURL(/\/login\?returnTo=/);
    const returnTo = new URL(page.url()).searchParams.get('returnTo');
    expect(returnTo).toBe('/whiskey-mbti?result=ESTJ-A');
    const callback = new URL('/oauth/kakao', page.url());
    await page.route('https://kauth.kakao.com/**', (route) => {
      const request = new URL(route.request().url());
      callback.searchParams.set(
        'state',
        request.searchParams.get('state') ?? '',
      );
      callback.searchParams.set('code', 'e2e-oauth-code');
      return route.fulfill({
        status: 302,
        headers: { Location: callback.href },
      });
    });
    await page.getByRole('button', { name: /카카오 로그인/ }).click();
    if (agreementRequired) {
      await expect(page).toHaveURL(/\/agreements\?returnTo=/);
      expect(new URL(page.url()).searchParams.get('returnTo')).toBe(returnTo);
      await page.getByText('[필수] 이용약관 동의', { exact: true }).click();
      await page
        .getByText('[필수] 개인정보 수집·이용 동의', { exact: true })
        .click();
      await page
        .getByRole('button', { name: '동의하고 시작하기', exact: true })
        .click();
    }
    await expect(page).toHaveURL(new URL(returnTo!, callback.origin).href);
    await expect(page.getByText('ESTJ-A', { exact: false })).toBeVisible();
    await expect(
      page.getByRole('button', { name: '친구에게 결과 공유하기', exact: true }),
    ).toBeVisible();
    expect(await getBrowserHistoryPaths(page)).not.toContain('/login');
  });
}

test('로그인한 사용자의 MBTI 결과는 새로고침 후 유지되고 다시 테스트할 때 지워진다', async ({
  page,
}) => {
  await page.route('**/api/auth/session', (route) =>
    route.fulfill({
      json: {
        accessToken: 'e2e-access-token',
        user: {
          userId: 1,
          sub: 'e2e@bottle-note.com',
          profile: null,
          roles: 'ROLE_USER',
        },
      },
    }),
  );
  await page.route('**/bottle-api/v1/blocks/ids', (route) =>
    route.fulfill({ json: { errors: [], data: [] } }),
  );
  await completeMbtiQuiz(page);
  await expect(page).toHaveURL(/\/whiskey-mbti\?result=ESTJ-A$/);
  await page.getByRole('button', { name: '결과 보기', exact: true }).click();
  await expect(page.getByText('ESTJ-A', { exact: false })).toBeVisible();
  await page.reload();
  await expect(page.getByText('ESTJ-A', { exact: false })).toBeVisible();
  await page
    .getByRole('button', { name: '다시 테스트하기', exact: true })
    .click();
  await expect(page).toHaveURL(/\/whiskey-mbti$/);
  await expect(
    page
      .getByRole('button')
      .filter({ has: page.locator('b', { hasText: /^A$/ }) }),
  ).toBeVisible();
  await expect(page.getByText('ESTJ-A', { exact: false })).toHaveCount(0);
});

test('공유받은 MBTI 결과는 비로그인 상태에서도 새로고침 후 유지된다', async ({
  page,
}) => {
  await page.route('**/api/auth/session', (route) =>
    route.fulfill({ status: 401, json: { message: 'No refresh token' } }),
  );
  await page.goto('/whiskey-mbti?result=ESTJ-A&shared=1');
  await expect(page.getByText('ESTJ-A', { exact: false })).toBeVisible();
  await page.reload();
  await expect(page.getByText('ESTJ-A', { exact: false })).toBeVisible();
  await expect(
    page.getByRole('button', {
      name: '로그인 후 나도 테스트하기',
      exact: true,
    }),
  ).toBeVisible();
});

test('이미 로그인한 사용자는 서버의 진입 검사로 결과 화면에 복귀한다', async ({
  page,
  context,
}) => {
  // 기존 로그인 세션을 쿠키로 주입하고 서버 페이지와 실제 세션 조회를 함께 확인한다.
  const encode = (value: unknown) =>
    Buffer.from(JSON.stringify(value)).toString('base64url');
  const accessToken = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({
    exp: Math.floor(Date.now() / 1000) + 3600,
    userId: 1,
    sub: 'e2e@bottle-note.com',
    profile: null,
    roles: 'ROLE_USER',
  })}.e2e`;
  await context.addCookies([
    {
      name: 'bn_access_token',
      value: accessToken,
      url: test.info().project.use.baseURL!,
      httpOnly: true,
      sameSite: 'Lax',
    },
  ]);
  await page.route('**/bottle-api/v1/blocks/ids', (route) =>
    route.fulfill({ json: { errors: [], data: [] } }),
  );
  await page.goto('/login?returnTo=%2Fwhiskey-mbti%3Fresult%3DESTJ-A');
  await expect(page).toHaveURL(/\/whiskey-mbti\?result=ESTJ-A$/);
  await expect(page.getByText('ESTJ-A', { exact: false })).toBeVisible();
  await expect(page.getByRole('button', { name: /카카오 로그인/ })).toHaveCount(
    0,
  );
});

test('갱신할 수 없는 기존 세션은 복귀 주소를 유지한 로그인 화면으로 돌아온다', async ({
  page,
  context,
}) => {
  await context.addCookies([
    {
      name: 'bn_refresh_token',
      value: 'e2e-invalid-refresh-token',
      url: test.info().project.use.baseURL!,
      httpOnly: true,
      sameSite: 'Lax',
    },
  ]);
  await page.goto('/login?returnTo=%2Fwhiskey-mbti%3Fresult%3DESTJ-A');
  await expect(page).toHaveURL(/\/login\?returnTo=/);
  await expect(
    page.getByRole('button', { name: /카카오 로그인/ }),
  ).toBeVisible();
  expect(new URL(page.url()).searchParams.get('returnTo')).toBe(
    '/whiskey-mbti?result=ESTJ-A',
  );
  expect(
    (await context.cookies()).some(
      (cookie) => cookie.name === 'bn_refresh_token',
    ),
  ).toBe(false);
});

for (const provider of ['kakao', 'apple']) {
  test(`앱 ${provider} 신규가입은 기기 정보를 한 번 전송하고 약관 동의 전 결과로 이동하지 않는다`, async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.isInApp = true;
      window.FlutterMessageQueue = { postMessage() {} };
      window.LogToFlutter = { postMessage() {} };
    });
    await page.route('**/api/auth/session', (route) =>
      route.fulfill({ status: 401, json: { message: 'No refresh token' } }),
    );
    await page.route('**/api/auth/login', (route) =>
      route.fulfill({
        json: {
          accessToken: 'e2e-token',
          user: {
            userId: 1,
            sub: 'e2e@bottle-note.com',
            profile: null,
            roles: 'ROLE_USER',
          },
          agreementRequired: true,
        },
      }),
    );
    await page.route('**/bottle-api/v1/blocks/ids', (route) =>
      route.fulfill({ json: { errors: [], data: [] } }),
    );
    let agreed = false;
    const status = {
      eligible: false,
      items: [
        { type: 'TERMS_OF_SERVICE', required: true, agreed: false },
        { type: 'PRIVACY_COLLECTION_USE', required: true, agreed: false },
        { type: 'MARKETING', required: false, agreed: false },
      ],
    };
    await page.route('**/bottle-api/v2/agreements/status', (route) =>
      route.fulfill({ json: { errors: [], data: status } }),
    );
    await page.route('**/bottle-api/v2/agreements', (route) => {
      agreed = true;
      return route.fulfill({
        json: { errors: [], data: { ...status, eligible: true } },
      });
    });
    let deviceCalls = 0;
    let releaseDevice!: () => void;
    const deviceResponse = new Promise<void>((resolve) => {
      releaseDevice = resolve;
    });
    await page.route('**/bottle-api/v1/push/token', async (route) => {
      deviceCalls += 1;
      await deviceResponse;
      await route.fulfill({ json: { errors: [], data: {} } });
    });
    const unexpectedResults: string[] = [];
    page.on('framenavigated', (frame) => {
      if (frame !== page.mainFrame()) return;
      const url = new URL(frame.url());
      if (!agreed && url.pathname === '/whiskey-mbti')
        unexpectedResults.push(url.pathname);
    });
    await page.goto('/login?returnTo=%2Fwhiskey-mbti%3Fresult%3DESTJ-A');
    await expect(
      page.getByRole('button', { name: /카카오 로그인/ }),
    ).toBeVisible();
    await page.evaluate((method) => {
      if (method === 'kakao') void window.onKakaoLoginSuccess('e2e-token');
      else
        void window.onAppleLoginSuccess(
          JSON.stringify({ idToken: 'e2e-id-token', nonce: 'e2e-nonce' }),
        );
    }, provider);
    await expect.poll(() => deviceCalls).toBeGreaterThan(0);
    releaseDevice();
    await expect(page).toHaveURL(/\/agreements\?returnTo=/);
    await page.getByText('[필수] 이용약관 동의', { exact: true }).click();
    await page
      .getByText('[필수] 개인정보 수집·이용 동의', { exact: true })
      .click();
    await page
      .getByRole('button', { name: '동의하고 시작하기', exact: true })
      .click();
    await expect(page).toHaveURL(/\/whiskey-mbti\?result=ESTJ-A$/);
    await expect(page.getByText('ESTJ-A', { exact: false })).toBeVisible();
    expect(deviceCalls).toBe(1);
    expect(unexpectedResults).toEqual([]);
  });
}

test('탈퇴 계정 로그인 실패는 홈에서 서버의 실패 이유를 안내한다', async ({
  page,
}) => {
  await page.route('**/api/auth/session', (route) =>
    route.fulfill({ status: 401, json: { message: 'No refresh token' } }),
  );
  await page.route('**/api/auth/login', (route) =>
    route.fulfill({
      status: 400,
      json: { code: 'USER_DELETED', message: '탈퇴한 유저입니다.' },
    }),
  );
  await page.goto(
    `/login?${new URLSearchParams({ returnTo: '/whiskey-mbti?result=ESTP-B', errorTo: '/whiskey-mbti' })}`,
  );
  const callback = new URL('/oauth/kakao', page.url());
  await page.route('https://kauth.kakao.com/**', (route) => {
    const request = new URL(route.request().url());
    callback.searchParams.set('state', request.searchParams.get('state') ?? '');
    callback.searchParams.set('code', 'e2e-oauth-code');
    return route.fulfill({ status: 302, headers: { Location: callback.href } });
  });
  await page.getByRole('button', { name: /카카오 로그인/ }).click();
  await expectHomeScreen(page);
  await expect(
    page.getByText('로그인에 실패했습니다.', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('탈퇴한 유저입니다.', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: '확인', exact: true }).click();
  await expectHomeScreen(page);
});

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
  await expectHomeScreen(page);

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
  await expectHomeScreen(page);

  expect(await getBrowserHistoryPaths(page)).not.toContain('/login');

  await page.goBack();
  await expectHomeScreen(page);
  await page.goForward();
  await expectHomeScreen(page);
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
  await expectHomeScreen(page);
  expect((await getBrowserHistoryPaths(page)).slice(-2)).toEqual([
    '/settings',
    '/',
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

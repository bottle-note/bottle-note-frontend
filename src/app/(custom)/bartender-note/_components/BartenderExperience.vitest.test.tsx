import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AlcoholsApi } from '@/api/alcohol/alcohol.api';
import type {
  AlcoholDetailsResponse,
  AlcoholLookupItem,
} from '@/api/alcohol/types';
import { MyBottleApi } from '@/api/my-bottle/my-bottle.api';
import type { PickMyBottleItem } from '@/api/my-bottle/types';
import { RateApi } from '@/api/rate/rate.api';
import { ReviewApi } from '@/api/review/review.api';
import { ScenarioApi } from '@/api/scenario/scenario.api';
import { ApiError } from '@/utils/ApiError';
import BartenderExperience from './BartenderExperience';
import type { Curation, Whiskey } from '../_data/demo';
import {
  SCENARIO_CONTEXT,
  mockScenarioApi,
} from '../_scenario/__fixtures__/scenario';
import { demoWhiskies } from '../_data/demo';
import * as scenarioApi from '../_scenario/scenarioApi';
import { trackGA4Event } from '@/utils/analytics/ga4';

vi.mock('@/utils/analytics/ga4', () => ({ trackGA4Event: vi.fn() }));

const { back, push, replace } = vi.hoisted(() => ({
  back: vi.fn(),
  push: vi.fn(),
  replace: vi.fn(),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ back, push, replace }),
  usePathname: () => '/bartender-note',
  useSearchParams: () => new URLSearchParams(),
}));
// 사진은 S3 업로드 URL로 올라간다. 테스트에서는 올린 결과 주소만 돌려준다.
vi.mock('@/utils/S3Upload', () => ({
  uploadImages: vi.fn(async (type: string, files: File | File[]) =>
    [files].flat().map((_, index) => ({
      order: index + 1,
      viewUrl: `https://images.test/${type}/${index + 1}`,
    })),
  ),
}));
// 기본은 로그인한 사용자다. 비로그인 시나리오는 auth.loggedIn을 바꾼다.
const auth = vi.hoisted(() => ({ loggedIn: true }));
vi.mock('@/hooks/auth/useAuthSession', () => ({
  useAuthSession: () => ({
    user: auth.loggedIn
      ? { sub: 'tester', profile: null, userId: 7 }
      : undefined,
    isLoggedIn: auth.loggedIn,
    isLoading: false,
  }),
}));

const whiskies: Whiskey[] = [
  {
    id: 101,
    name: '라프로익 10년',
    category: '싱글 몰트',
    region: '아일라',
    abv: 40,
    rating: 4.0,
    tags: ['피트', '스모키', '바닷바람'],
    bottlePrice: 89000,
    glassPrice: 22000,
  },
  {
    id: 102,
    name: '아드벡 10년',
    category: '싱글 몰트',
    region: '아일라',
    abv: 46,
    rating: 4.2,
    tags: ['피트', '스모키', '레몬'],
    bottlePrice: 106000,
    glassPrice: 24000,
  },
  {
    id: 103,
    name: '글렌피딕 12년',
    category: '싱글 몰트',
    region: '스페이사이드',
    abv: 40,
    rating: 3.7,
    tags: ['사과', '배', '바닐라'],
    bottlePrice: 68000,
    glassPrice: 18000,
  },
  {
    id: 104,
    name: '조니워커 블랙',
    category: '블렌디드',
    region: '스코틀랜드',
    abv: 40,
    rating: 3.6,
    tags: ['스모키', '바닐라', '과일'],
    bottlePrice: 48000,
    glassPrice: 14000,
  },
  {
    id: 105,
    name: '메이커스 마크',
    category: '버번',
    region: '켄터키',
    abv: 45,
    rating: 3.8,
    tags: ['바닐라', '캐러멜', '오크'],
    bottlePrice: 52000,
    glassPrice: 15000,
  },
];

const curations: Curation[] = [
  {
    id: 1,
    situation: 'home',
    unit: 'bottle',
    title: '집에서 여는 첫 병',
    description: '처음엔 탄산, 다음엔 얼음, 마지막엔 그대로.',
    whiskeyIds: [103, 104],
  },
  {
    id: 2,
    situation: 'gift',
    unit: 'bottle',
    title: '선물 5만 원대',
    description: '고마운 마음을 전하기 좋은 병.',
    whiskeyIds: [104, 105],
  },
  {
    id: 3,
    situation: 'gift',
    unit: 'bottle',
    title: '선물 10만 원대',
    description: '조금 더 신경 쓴 선물.',
    whiskeyIds: [101, 102],
  },
];

const lookupItem: AlcoholLookupItem = {
  alcoholId: 900,
  korName: '탈리스커 10년',
  engName: 'Talisker 10',
  imageUrl: '',
  korCategoryName: '싱글 몰트',
  engCategoryName: 'Single Malt',
  categoryGroup: 'SINGLE_MALT',
  korRegion: '스코틀랜드',
  engRegion: 'Scotland',
  korDistillery: '탈리스커',
  engDistillery: 'Talisker',
  regionId: 1,
  distilleryId: 1,
};

const lookupDetails: AlcoholDetailsResponse = {
  alcohols: {
    alcoholId: lookupItem.alcoholId,
    alcoholUrlImg: lookupItem.imageUrl,
    description: '바다 향이 나는 위스키',
    korName: lookupItem.korName,
    engName: lookupItem.engName,
    korCategory: lookupItem.korCategoryName,
    engCategory: lookupItem.engCategoryName,
    korRegion: lookupItem.korRegion,
    engRegion: lookupItem.engRegion,
    cask: '',
    abv: '45.8%',
    korDistillery: lookupItem.korDistillery,
    engDistillery: lookupItem.engDistillery,
    rating: 4.1,
    myAvgRating: 0,
    myRating: 0,
    totalRatingsCount: 12,
    isPicked: false,
    alcoholsTastingTags: ['피트', '바다'],
  },
  friendsInfo: { followerCount: 0, friends: [] },
  reviewInfo: { reviewList: [] },
};

function pickItem(
  alcoholId: number,
  alcoholKorName: string,
  korCategoryName = '싱글 몰트',
): PickMyBottleItem {
  return {
    baseMyBottleInfo: {
      alcoholId,
      alcoholKorName,
      alcoholEngName: '',
      korCategoryName,
      imageUrl: '',
      isHot: false,
    },
    isPicked: true,
    totalPicksCount: 1,
  };
}

/** 서버 찜 목록 대역. 찜 토글 요청이 이 목록을 바꾼다. */
let serverPicks: PickMyBottleItem[] = [];

function stubPickApi() {
  vi.spyOn(MyBottleApi, 'getPicks').mockImplementation(async ({ userId }) => ({
    success: true,
    code: 200,
    data: { userId, isMyPage: true, myBottleList: [...serverPicks] },
    errors: [],
    meta: {
      serverEncoding: 'UTF-8',
      serverVersion: '1.0.0',
      serverPathVersion: 'v1',
      serverResponseTime: '',
      pagination: { hasNext: false, nextCursor: null },
    },
  }));
  return vi
    .spyOn(AlcoholsApi, 'putPick')
    .mockImplementation(async ({ alcoholId, isPicked }) => {
      const whiskey = whiskies.find(({ id }) => id === Number(alcoholId));
      serverPicks = isPicked
        ? [pickItem(Number(alcoholId), whiskey?.name ?? ''), ...serverPicks]
        : serverPicks.filter(
            (item) => item.baseMyBottleInfo.alcoholId !== Number(alcoholId),
          );
      return {
        success: true,
        code: 200,
        data: { message: '', status: isPicked ? 'PICK' : 'UNPICK' },
        errors: [],
        meta: {
          serverEncoding: 'UTF-8',
          serverVersion: '1.0.0',
          serverPathVersion: 'v1',
          serverResponseTime: '',
        },
      };
    });
}

const meta = {
  serverEncoding: 'UTF-8',
  serverVersion: '1.0.0',
  serverPathVersion: 'v1',
  serverResponseTime: '',
};

/** 리뷰 저장 대역. 저장하면 리뷰 id 77을 돌려준다. */
function stubReviewApi() {
  vi.spyOn(RateApi, 'postRating').mockResolvedValue({
    success: true,
    code: 200,
    data: { rating: '5.0', message: '' },
    errors: [],
    meta,
  });
  return vi.spyOn(ReviewApi, 'registerReview').mockResolvedValue({
    success: true,
    code: 200,
    data: { id: 77, content: '', callback: '' },
    errors: [],
    meta,
  });
}

function renderExperience() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <BartenderExperience
        whiskies={whiskies}
        curations={curations}
        scenarioContext={SCENARIO_CONTEXT}
      />
    </QueryClientProvider>,
  );
}

const dialogue = () =>
  screen.getByRole('button', { name: '노트의 대사, 누르면 이어 보기' });

/** 선택지 버튼은 제목과 설명을 함께 읽으므로 제목으로 시작하는 버튼을 고른다. */
async function choose(title: string) {
  const button = await screen.findByRole('button', {
    name: (name) => name === title || name.startsWith(`${title} `),
  });
  await waitFor(() => expect(button).toBeEnabled());
  fireEvent.click(button);
}

async function press(name: string | RegExp) {
  const button = await screen.findByRole('button', { name });
  await waitFor(() => expect(button).toBeEnabled());
  fireEvent.click(button);
}

async function answerTasteQuestions(answers: {
  kind: string;
  axis: string;
  abv: string;
  price: string;
}) {
  await choose('위스키 추천해 주세요');
  await choose(answers.kind);
  await choose(answers.axis);
  await choose(answers.abv);
  await choose('잔');
  await choose(answers.price);
}

/** 추천 결과에서 1위를 먼저 건네는 카드. */
const firstPick = () => screen.findByRole('region', { name: '오늘의 첫 잔' });

/** 술 상세에서 리뷰 작성을 시작해 한 줄 리뷰를 쓰고 별점 단계까지 간다. */
async function writeQuickReview(text: string) {
  await press('리뷰 작성');
  await choose('내 느낌 한 줄로 쓸게요');
  fireEvent.change(await screen.findByRole('textbox', { name: '리뷰 본문' }), {
    target: { value: text },
  });
  await press('다 썼어요');
  await press(/다 그렸어요|그래프 없이 넘어갈게요/);
  await press('사진 없이 넘어갈게요');
}

async function openHomeCurationDetail(name: string) {
  await choose('상황에 맞게 추천해 주세요');
  await choose('집에서 마실 한 병');
  await press(new RegExp(name));
  await screen.findByRole('heading', { name });
}

beforeEach(() => {
  vi.restoreAllMocks();
  mockScenarioApi();
  back.mockClear();
  push.mockClear();
  replace.mockClear();
  auth.loggedIn = true;
  window.sessionStorage.clear();
  serverPicks = [];
  stubPickApi();
  vi.mocked(trackGA4Event).mockClear();
  vi.spyOn(AlcoholsApi, 'getWeeklyViewPopular').mockResolvedValue({
    success: true,
    code: 200,
    data: { totalCount: 0, alcohols: [] },
    errors: [],
    meta,
  });
  vi.spyOn(AlcoholsApi, 'getAlcoholDetails').mockImplementation(async (id) => {
    const whiskey = [...whiskies, ...demoWhiskies].find(
      (item) => item.id === Number(id),
    );
    const data =
      Number(id) === 900
        ? lookupDetails
        : {
            ...lookupDetails,
            alcohols: {
              ...lookupDetails.alcohols,
              alcoholId: Number(id),
              korName: whiskey!.name,
              korCategory: whiskey!.category,
              abv: String(whiskey!.abv),
              rating: whiskey!.rating ?? 0,
              totalRatingsCount: whiskey!.rating === null ? 0 : 12,
              alcoholsTastingTags: whiskey!.tags,
            },
          };
    return { success: true, code: 200, data, errors: [], meta };
  });
  // 모션 줄이기 환경에서는 인사 동작과 타자 효과 없이 대사와 선택지가 바로 보인다.
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('reduce'),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  }));
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    get: () => 320,
  });
  HTMLCanvasElement.prototype.getContext = vi.fn(() => null);
  Element.prototype.scrollTo = vi.fn();
});

describe('바텐더 노트 취향 추천', () => {
  it('응답의 질문·보기로 진행하고 1위를 먼저 건넨 뒤 내부 상세와 CTA를 보여 준다', async () => {
    renderExperience();
    await choose('위스키 추천해 주세요');
    expect(await screen.findByText('질문 1')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    await choose('싱글 몰트');
    await screen.findByText('질문 2');
    // 좁혀진 후보 수는 질문·보기·결과 어디에도 보이지 않는다
    expect(screen.queryByText(/\d+병/)).not.toBeInTheDocument();
    await choose('피트·스모키');
    await choose('상관없어요');
    await choose('병');
    expect(await screen.findByText('질문 5')).toBeInTheDocument();
    await choose('5~10만 원');
    const card = await firstPick();
    expect(
      within(card).getByRole('heading', { name: '글렌피딕 12년' }),
    ).toBeInTheDocument();
    expect(within(card).getByText('싱글 몰트 · 40%')).toBeInTheDocument();
    // 후보 응답에 없는 태그는 1위 술 상세에서 채우고, 가로 카드에는 세 개까지 둔다
    expect(
      within(within(card).getByRole('list', { name: '테이스팅 태그' }))
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual(['사과', '배', '바닐라']);
    expect(dialogue()).toHaveTextContent('글렌피딕 12년입니다.');
    expect(screen.queryByText(/\d+병/)).not.toBeInTheDocument();
    await press('이 술 자세히 볼게요');
    expect(
      await screen.findByRole('heading', { name: '글렌피딕 12년', level: 1 }),
    ).toBeInTheDocument();
    expect(AlcoholsApi.getAlcoholDetails).toHaveBeenCalledWith('247');
    expect(screen.getByRole('link', { name: '자세히 볼게요' })).toHaveAttribute(
      'href',
      '/alcohols/247',
    );
    expect(
      screen.getByRole('button', { name: '리뷰 작성' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('대략 가격')).not.toBeInTheDocument();
    await press('이전 단계');
    expect(await firstPick()).toBeInTheDocument();
  });

  it('첫 잔에서 다른 후보 목록을 보고, 뒤로 가면 첫 잔과 마지막 질문 순서로 돌아간다', async () => {
    renderExperience();
    await answerTasteQuestions({
      kind: '상관없어요',
      axis: '상관없어요',
      abv: '상관없어요',
      price: '상관없어요',
    });
    await firstPick();
    await press('다른 후보');
    expect(await screen.findByText('바텐더가 고른 술')).toBeInTheDocument();
    // 목록은 1위부터 같은 모양의 행으로 보여 준다
    const rows = screen
      .getAllByRole('button')
      .filter((button) => /^\d/.test(button.textContent ?? ''));
    expect(rows[0]).toHaveTextContent('글렌피딕 12년');
    expect(rows).toHaveLength(4);
    await press('이전 단계');
    await firstPick();
    // 첫 잔과 목록을 오가도 같은 결과 이벤트는 한 번만 보낸다
    expect(
      vi
        .mocked(trackGA4Event)
        .mock.calls.filter(([event]) => event === 'bartender_recommend_result'),
    ).toHaveLength(1);
    await press('이전 질문');
    expect(await screen.findByText('질문 5')).toBeInTheDocument();
  });

  it('후보가 1위 한 병뿐이면 다른 후보 보기를 내놓지 않는다', async () => {
    const evaluate = vi.mocked(ScenarioApi.evaluate);
    const fixture = evaluate.getMockImplementation()!;
    evaluate.mockImplementation(async (id, request, signal) => {
      const response = await fixture(id, request, signal);
      return response.state === 'SCENARIO_END'
        ? {
            ...response,
            candidates: {
              ...response.candidates,
              content: response.candidates.content.slice(0, 1),
            },
          }
        : response;
    });
    renderExperience();
    await answerTasteQuestions({
      kind: '상관없어요',
      axis: '상관없어요',
      abv: '상관없어요',
      price: '상관없어요',
    });
    await firstPick();
    expect(
      screen.queryByRole('button', { name: '다른 후보' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '이 술 자세히 볼게요' }),
    ).toBeInTheDocument();
  });

  it('1위 술 상세 조회가 실패해도 태그 없이 첫 잔을 건넨다', async () => {
    vi.mocked(AlcoholsApi.getAlcoholDetails).mockRejectedValueOnce(
      new Error('상세 조회 실패'),
    );
    renderExperience();
    await answerTasteQuestions({
      kind: '상관없어요',
      axis: '상관없어요',
      abv: '상관없어요',
      price: '상관없어요',
    });
    const card = await firstPick();
    expect(
      within(card).getByRole('heading', { name: '글렌피딕 12년' }),
    ).toBeInTheDocument();
    expect(
      within(card).queryByRole('list', { name: '테이스팅 태그' }),
    ).not.toBeInTheDocument();
  });

  it('빈 후보 결과에서 이전 질문으로 돌아가 답변을 다시 고를 수 있다', async () => {
    renderExperience();
    await choose('위스키 추천해 주세요');
    await choose('라이');
    await choose('상관없어요');
    await choose('상관없어요');
    await choose('잔');
    vi.spyOn(scenarioApi, 'getScenarioStep').mockResolvedValueOnce({
      versionId: 3,
      question: null,
      completed: true,
      candidates: { items: [], totalCount: 0, nextCursor: null },
    });
    await choose('상관없어요');
    expect(await screen.findByText('추천 후보가 없어요')).toBeInTheDocument();
    await press('이전 질문');
    expect(await screen.findByText('질문 5')).toBeInTheDocument();
    await choose('1.5만 원 이하');
    expect(await firstPick()).toBeInTheDocument();
  });

  it('서버 ANY 보기도 기존 choiceId 답변으로 누적하고 중복 보기 없이 표시한다', async () => {
    const request = vi.spyOn(scenarioApi, 'getScenarioStep');
    renderExperience();
    await choose('위스키 추천해 주세요');
    await screen.findByRole('button', { name: /^싱글 몰트/ });
    // 고를 수 없는 보기는 비활성으로도 보이지 않는다
    expect(
      screen.queryByRole('button', { name: /^기타/ }),
    ).not.toBeInTheDocument();
    await choose('상관없어요');
    await screen.findByText('질문 2');
    expect(
      await screen.findAllByRole('button', { name: /^상관없어요/ }),
    ).toHaveLength(1);
    expect(request).toHaveBeenLastCalledWith(
      expect.objectContaining({
        answers: [
          {
            questionId: 11,
            value: { kind: 'choice', choiceId: 'mock:11:any' },
          },
        ],
      }),
      expect.anything(),
    );
  });

  it('종류를 다시 고르면 향 질문과 보기가 바뀌고 입력 중인 값은 초기화한다', async () => {
    renderExperience();
    await choose('위스키 추천해 주세요');
    await choose('버번');
    expect(
      await screen.findByRole('button', { name: /^부드러운·밀/ }),
    ).toBeInTheDocument();
    await press('이전 질문');
    await choose('라이');
    expect(
      await screen.findByRole('button', { name: /^스파이시·호밀/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /^부드러운·밀/ }),
    ).not.toBeInTheDocument();
  });

  it('질문 조회 실패는 오류로 표시하고 같은 답변으로 다시 시도한다', async () => {
    const request = vi.spyOn(scenarioApi, 'getScenarioStep');
    renderExperience();
    await choose('위스키 추천해 주세요');
    request.mockRejectedValueOnce(new Error('질문 조회 실패'));
    await choose('싱글 몰트');
    expect(await screen.findByRole('alert')).toHaveTextContent(
      '정보를 불러오지 못했어요',
    );
    await press('다시 시도');
    expect(
      await screen.findByRole('button', { name: /^피트·스모키/ }),
    ).toBeInTheDocument();
  });

  it('게시 버전이 바뀌면 처음부터 다시 조회하고 이전 답변을 보내지 않는다', async () => {
    renderExperience();
    await choose('위스키 추천해 주세요');
    vi.mocked(ScenarioApi.evaluate).mockRejectedValueOnce(
      new ApiError('게시 버전 변경', new Response(null, { status: 409 })),
    );
    await choose('싱글 몰트');
    expect(await screen.findByRole('alert')).toHaveTextContent(
      '질문지가 업데이트됐어요',
    );
    await press('처음부터 다시 시작');
    await choose('버번');
    expect(
      await screen.findByRole('button', { name: /^부드러운·밀/ }),
    ).toBeInTheDocument();
    expect(ScenarioApi.get).toHaveBeenCalledTimes(2);
    expect(ScenarioApi.evaluate).toHaveBeenLastCalledWith(
      3,
      {
        versionId: 3,
        answers: [{ questionId: 11, optionId: 'mock:11:bourbon' }],
        mode: 'QUESTION',
      },
      expect.anything(),
    );
  });

  it('추천 더 보기는 목록을 유지하며 실패 후 같은 cursor로 재시도한다', async () => {
    const evaluate = vi.mocked(ScenarioApi.evaluate);
    const fixture = evaluate.getMockImplementation()!;
    evaluate.mockImplementation(async (id, request, signal) => {
      const response = await fixture(id, request, signal);
      if (response.state === 'SCENARIO_END') {
        return {
          ...response,
          candidates: {
            content: response.candidates.content.slice(0, 1),
            pagination: { hasNext: true, nextCursor: 'signed-next-page' },
          },
        };
      }
      return response;
    });
    renderExperience();
    await answerTasteQuestions({
      kind: '상관없어요',
      axis: '상관없어요',
      abv: '상관없어요',
      price: '상관없어요',
    });
    await firstPick();
    await press('다른 후보');
    await screen.findByText('바텐더가 고른 술');
    evaluate.mockRejectedValueOnce(new Error('다음 페이지 실패'));
    await press('추천 더 보기');
    expect(await screen.findByRole('alert')).toHaveTextContent(
      '다음 추천을 불러오지 못했어요',
    );
    expect(
      screen.getByRole('button', { name: /글렌피딕 12년/ }),
    ).toBeInTheDocument();
    evaluate.mockImplementationOnce(async (id, request, signal) => {
      const response = await fixture(id, request, signal);
      return {
        ...response,
        candidates: {
          content: response.candidates.content.slice(1),
          pagination: { hasNext: false, nextCursor: null },
        },
      };
    });
    await press('다시 불러오기');
    expect(
      await screen.findByRole('button', { name: /불렛 라이/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /글렌피딕 12년/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: '추천 더 보기' }),
    ).not.toBeInTheDocument();
    expect(evaluate).toHaveBeenLastCalledWith(
      3,
      expect.objectContaining({
        versionId: 3,
        mode: 'RESULT',
        cursor: 'signed-next-page',
        answers: expect.any(Array),
      }),
      expect.anything(),
    );
  });

  it('대사 재생 중에도 하단 CTA의 첫 클릭으로 리뷰 작성을 시작할 수 있다', async () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
    renderExperience();
    await openHomeCurationDetail('글렌피딕 12년');
    await press('리뷰 작성');
    expect(
      await screen.findByRole('button', { name: /^내 느낌 한 줄/ }),
    ).toBeInTheDocument();
  });

  it('잔·병 선택과 예산은 서버가 제공한 별도 질문의 답변으로 제출한다', async () => {
    const request = vi.spyOn(scenarioApi, 'getScenarioStep');
    renderExperience();
    await choose('위스키 추천해 주세요');
    await choose('상관없어요');
    await choose('상관없어요');
    await choose('상관없어요');
    await choose('병');
    await screen.findByText('질문 5');
    expect(request).toHaveBeenLastCalledWith(
      expect.objectContaining({
        answers: expect.arrayContaining([
          {
            questionId: 15,
            value: { kind: 'choice', choiceId: 'mock:15:bottle' },
          },
        ]),
      }),
      expect.anything(),
    );
    await choose('5~10만 원');
    await firstPick();
    expect(request).toHaveBeenLastCalledWith(
      expect.objectContaining({
        answers: expect.arrayContaining([
          {
            questionId: 17,
            value: { kind: 'choice', choiceId: 'mock:17:bottle-50000-100000' },
          },
        ]),
      }),
      expect.anything(),
    );
  });
});

describe('바텐더 노트 첫 잔 이야기', () => {
  const anyAnswers = {
    kind: '상관없어요',
    axis: '상관없어요',
    abv: '상관없어요',
    price: '상관없어요',
  };
  /** 1위 술 상세의 설명만 바꾼다. 1위 상세는 결과를 받을 때 가장 먼저 조회한다. */
  const withLeadDescription = (description: string) => {
    const details = vi.mocked(AlcoholsApi.getAlcoholDetails);
    const original = details.getMockImplementation()!;
    details.mockImplementationOnce(async (id) => {
      const response = await original(id);
      return {
        ...response,
        data: {
          ...response.data,
          alcohols: { ...response.data.alcohols, description },
        },
      };
    });
  };
  const events = (name: string) =>
    vi.mocked(trackGA4Event).mock.calls.filter(([event]) => event === name);

  const conversation = () =>
    screen.getByRole('log', { name: '노트와 나눈 대화' });

  it('들려달라고 하면 카드 아래 말풍선으로 들려주고, 다 들으면 맺은 뒤 다시 듣기와 전체 글을 남긴다', async () => {
    renderExperience();
    await answerTasteQuestions(anyAnswers);
    await firstPick();
    expect(conversation()).toHaveTextContent('오늘의 첫 잔이에요.');
    // 대답은 하단이 아니라 묻는 말풍선에 달린다
    expect(
      await within(conversation()).findByRole('button', { name: '들려주세요' }),
    ).toBeInTheDocument();
    await press('들려주세요');
    await waitFor(() =>
      expect(conversation()).toHaveTextContent('바다 향이 나는 위스키'),
    );
    expect(conversation()).toHaveTextContent('나: 들려주세요');
    expect(trackGA4Event).toHaveBeenCalledWith('bartender_story_start', {
      alcohol_id: '247',
      trigger: 'offer',
    });
    // 한 문장뿐이라 그 문장으로 이야기가 끝난다
    expect(trackGA4Event).toHaveBeenCalledWith('bartender_story_complete', {
      alcohol_id: '247',
    });
    await waitFor(() =>
      expect(dialogue()).toHaveTextContent('이야기는 이쯤 하고요.'),
    );
    expect(
      await screen.findByRole('button', { name: '전체 글 보기' }),
    ).toBeInTheDocument();
    await press('다시 듣기');
    expect(trackGA4Event).toHaveBeenLastCalledWith('bartender_story_start', {
      alcohol_id: '247',
      trigger: 'replay',
    });
  });

  it('첫 문단을 한 문장씩 들려주고, 문단이 더 있으면 전체 글로 안내한다', async () => {
    withLeadDescription(
      '첫 문장입니다. 둘째 \n문장입니다.\n\n \n\n다음 문단입니다.',
    );
    renderExperience();
    await answerTasteQuestions(anyAnswers);
    await firstPick();
    await press('들려주세요');
    await waitFor(() =>
      expect(conversation()).toHaveTextContent('첫 문장입니다.'),
    );
    expect(conversation()).not.toHaveTextContent('둘째');
    expect(events('bartender_story_complete')).toHaveLength(0);
    await press('계속 들려주세요');
    // 문단 안의 줄바꿈은 공백으로 합친다
    await waitFor(() =>
      expect(conversation()).toHaveTextContent('둘째 문장입니다.'),
    );
    expect(conversation()).toHaveTextContent('나: 계속 들려주세요');
    expect(conversation()).not.toHaveTextContent('다음 문단입니다.');
    await waitFor(() =>
      expect(dialogue()).toHaveTextContent(
        '더 긴 이야기는 전체 글에 적어 뒀어요.',
      ),
    );
    expect(events('bartender_story_complete')).toHaveLength(1);
    await press('전체 글 보기');
    expect(
      await screen.findByRole('heading', { name: '글렌피딕 12년', level: 3 }),
    ).toBeInTheDocument();
    expect(trackGA4Event).toHaveBeenCalledWith('bartender_story_full_text', {
      alcohol_id: '247',
    });
    expect(
      screen.getByText('다음 문단입니다.', { selector: 'p' }),
    ).toBeInTheDocument();
  });

  it('다음에 듣겠다고 하면 답하고, 상세에 다녀와도 같은 술은 다시 묻지 않는다', async () => {
    renderExperience();
    await answerTasteQuestions(anyAnswers);
    await firstPick();
    await press('다음에요');
    await waitFor(() =>
      expect(conversation()).toHaveTextContent(
        '이 술 이야기가 궁금해지면 언제든 말씀하세요.',
      ),
    );
    expect(conversation()).toHaveTextContent('나: 다음에요');
    expect(trackGA4Event).toHaveBeenCalledWith('bartender_story_skip', {
      alcohol_id: '247',
      stage: 'offer',
    });
    await press('이 술 자세히 볼게요');
    await screen.findByRole('heading', { name: '글렌피딕 12년', level: 1 });
    await press('이전 단계');
    await firstPick();
    expect(
      screen.queryByRole('button', { name: '들려주세요' }),
    ).not.toBeInTheDocument();
    expect(conversation()).not.toHaveTextContent('나: 다음에요');
    expect(
      await screen.findByRole('button', { name: '이야기 듣기' }),
    ).toBeEnabled();
    expect(dialogue()).toHaveTextContent('글렌피딕 12년입니다.');
  });

  it('이야기 도중 그만 들을 수 있다', async () => {
    withLeadDescription('첫 문장입니다. 둘째 문장입니다.');
    renderExperience();
    await answerTasteQuestions(anyAnswers);
    await firstPick();
    await press('들려주세요');
    await press('그만 들을게요');
    await waitFor(() =>
      expect(conversation()).toHaveTextContent(
        '이 술 이야기가 궁금해지면 언제든 말씀하세요.',
      ),
    );
    expect(conversation()).not.toHaveTextContent('둘째 문장입니다.');
    expect(trackGA4Event).toHaveBeenCalledWith('bartender_story_skip', {
      alcohol_id: '247',
      stage: 'telling',
    });
    expect(events('bartender_story_complete')).toHaveLength(0);
  });

  it('설명이 없는 술은 이야기를 꺼내지 않는다', async () => {
    withLeadDescription(' \n\n ');
    renderExperience();
    await answerTasteQuestions(anyAnswers);
    await firstPick();
    expect(
      screen.queryByRole('button', { name: '들려주세요' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: '전체 글 보기' }),
    ).not.toBeInTheDocument();
  });

  it('첫 잔에서 다른 후보를 보면 그 선택을 기록한다', async () => {
    renderExperience();
    await answerTasteQuestions(anyAnswers);
    await firstPick();
    await press('다른 후보');
    await screen.findByText('바텐더가 고른 술');
    expect(events('bartender_show_other_candidates')).toHaveLength(1);
  });
});

describe('바텐더 노트 상황별 추천', () => {
  it('큐레이션이 하나뿐인 상황은 바로 술 목록을 보여 주고 술 상세로 이어진다', async () => {
    renderExperience();

    await choose('상황에 맞게 추천해 주세요');
    await choose('집에서 마실 한 병');

    expect(
      await within(screen.getByRole('banner')).findByText('집에서 여는 첫 병'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: '큐레이션 전체 보기' }),
    ).toHaveAttribute('href', '/curation/1');
    expect(
      within(screen.getByRole('group', { name: '현재 단계 행동' })).queryByRole(
        'button',
      ),
    ).not.toBeInTheDocument();
    expect(
      within(screen.getByRole('navigation', { name: '다른 보기' })).getByRole(
        'button',
        { name: '다른 주제 보기' },
      ),
    ).toBeInTheDocument();

    await press(/조니워커 블랙/);

    expect(
      await screen.findByRole('heading', { name: '조니워커 블랙' }),
    ).toBeInTheDocument();
    expect(dialogue()).toHaveTextContent(
      '「집에서 여는 첫 병」에 담긴 병이에요.',
    );
  });

  it('큐레이션이 여러 개인 상황은 큐레이션을 고르게 한다', async () => {
    renderExperience();

    await choose('상황에 맞게 추천해 주세요');
    await choose('선물용 위스키 추천');
    await choose('선물 10만 원대');

    expect(
      await screen.findByRole('button', { name: /아드벡 10년/ }),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole('banner')).getByText('선물 10만 원대'),
    ).toBeInTheDocument();
  });

  it('큐레이션이 없는 상황은 취향 질문으로 이어갈 수 있다', async () => {
    renderExperience();

    await choose('상황에 맞게 추천해 주세요');
    await choose('바에서 마실 한 잔');

    expect(dialogue()).toHaveTextContent(
      '이 자리의 큐레이션은 지금 준비 중이에요.',
    );
    await press('취향으로 골라 주세요');

    expect(await screen.findByText('질문 1')).toBeInTheDocument();
  });
});

describe('바텐더 노트 찜', () => {
  it('술 상세에서 찜하면 서버에 저장하고 처음 화면의 찜 목록에서 다시 볼 수 있다', async () => {
    const { unmount } = renderExperience();
    await openHomeCurationDetail('글렌피딕 12년');

    await press('찜하기');

    // 찜 알림 대사가 나오는 동안 선택지가 다시 그려지므로 최종 상태를 기다린다.
    await waitFor(() =>
      expect(screen.getByRole('button', { name: '찜 취소' })).toHaveAttribute(
        'aria-pressed',
        'true',
      ),
    );
    expect(AlcoholsApi.putPick).toHaveBeenCalledWith({
      alcoholId: 103,
      isPicked: true,
    });
    expect(dialogue()).toHaveTextContent('찜해 두었습니다.');

    await press('닫기');
    expect(push).toHaveBeenCalledWith('/');
    unmount();
    renderExperience();
    await press('찜한 술 보기');
    await press(/글렌피딕 12년/);

    expect(
      await screen.findByRole('heading', { name: '글렌피딕 12년' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '찜 취소' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('데모 포함 여부와 관계없이 찜한 술은 내부 상세로 연결한다', async () => {
    serverPicks = [
      pickItem(900, '탈리스커 10년'),
      pickItem(104, '조니워커 블랙', '블렌디드'),
    ];
    renderExperience();

    await press('찜한 술 보기');

    expect(
      await screen.findByRole('button', { name: /탈리스커 10년/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /탈리스커 10년/ }),
    ).not.toBeInTheDocument();
    await press(/탈리스커 10년/);
    expect(
      await screen.findByRole('heading', { name: '탈리스커 10년' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '자세히 볼게요' })).toHaveAttribute(
      'href',
      '/alcohols/900',
    );
    await press('이전 단계');
    await press(/조니워커 블랙/);
    expect(
      await screen.findByRole('heading', { name: '조니워커 블랙' }),
    ).toBeInTheDocument();
  });

  it('찜 저장에 실패하면 찜하지 않은 상태로 되돌리고 알려 준다', async () => {
    vi.spyOn(AlcoholsApi, 'putPick').mockRejectedValue(
      new Error('찜하기 업데이트에 실패했습니다.'),
    );
    renderExperience();
    await openHomeCurationDetail('글렌피딕 12년');

    await press('찜하기');

    await waitFor(() => {
      expect(dialogue()).toHaveTextContent('찜을 바꾸지 못했어요.');
      expect(screen.getByRole('button', { name: '찜하기' })).toHaveAttribute(
        'aria-pressed',
        'false',
      );
    });
  });
});

describe('바텐더 노트 리뷰', () => {
  it('술 상세에서 리뷰를 간편하게 작성해 등록하면 서버에 저장하고 내 리뷰로 갈 수 있다', async () => {
    const register = stubReviewApi();
    renderExperience();
    await openHomeCurationDetail('글렌피딕 12년');

    await writeQuickReview('사과 향이 산뜻하고 부드러워요');
    await press('별점 없이 넘어갈게요');
    await press('장소와 가격 건너뛰기');

    expect(await screen.findByText('다 됐습니다')).toBeInTheDocument();
    expect(
      screen.getByText('사과 향이 산뜻하고 부드러워요'),
    ).toBeInTheDocument();
    await press('비공개');
    await press('이걸로 등록할게요');

    // 완료 대사가 나오는 동안 선택지가 다시 그려지므로 최종 상태를 기다린다.
    await waitFor(() =>
      expect(screen.getByText('✓ 등록됨 · 비공개')).toBeInTheDocument(),
    );
    expect(screen.getByText('등록 완료')).toBeInTheDocument();
    expect(register).toHaveBeenCalledWith(
      expect.objectContaining({
        alcoholId: '103',
        status: 'PRIVATE',
        content: '사과 향이 산뜻하고 부드러워요',
        sizeType: null,
        price: null,
        rating: 0,
        locationInfo: { locationName: null },
        imageUrlList: null,
        tastingProfile: {
          version: 1,
          maxScore: 5,
          axes: expect.arrayContaining([
            expect.objectContaining({ code: 'FRUITY', score: 2 }),
            expect.objectContaining({ code: 'BODY', score: 2 }),
          ]),
        },
      }),
    );
    expect(RateApi.postRating).not.toHaveBeenCalled();

    await choose('내 리뷰 볼게요');
    expect(push).toHaveBeenCalledWith('/review/77');
  });

  it('리뷰 저장에 실패하면 미리보기에 남아 다시 등록할 수 있다', async () => {
    const register = stubReviewApi().mockRejectedValueOnce(
      new Error('리뷰 등록에 실패했습니다.'),
    );
    renderExperience();
    await openHomeCurationDetail('글렌피딕 12년');
    await writeQuickReview('사과 향이 산뜻해요');
    await press('별점 없이 넘어갈게요');
    await press('장소와 가격 건너뛰기');

    await press('이걸로 등록할게요');

    await waitFor(() =>
      expect(dialogue()).toHaveTextContent('리뷰를 올리지 못했어요.'),
    );
    expect(screen.getByText('다 됐습니다')).toBeInTheDocument();

    await press('이걸로 등록할게요');

    // 완료 대사가 나오는 동안 선택지가 다시 그려지므로 최종 상태를 기다린다.
    await waitFor(() =>
      expect(screen.getByText('✓ 등록됨 · 공개')).toBeInTheDocument(),
    );
    expect(register).toHaveBeenCalledTimes(2);
  });

  it('리뷰는 저장됐는데 별점 저장에 실패하면 완료 화면에서 알려 준다', async () => {
    stubReviewApi();
    vi.spyOn(RateApi, 'postRating').mockRejectedValue(
      new Error('별점 등록에 실패했습니다.'),
    );
    renderExperience();
    await openHomeCurationDetail('글렌피딕 12년');
    await writeQuickReview('사과 향이 산뜻해요');

    const rating = await screen.findByRole('slider', { name: '내 별점' });
    fireEvent.keyDown(rating, { key: 'End' });
    fireEvent.keyUp(rating, { key: 'End' });
    // 별점을 고르면 잠시 뒤 장소 단계로 넘어간다.
    await waitFor(() =>
      expect(dialogue()).toHaveTextContent('어디에서 드셨나요?'),
    );
    await press('장소와 가격 건너뛰기');
    await press('이걸로 등록할게요');

    // 완료 대사가 나오는 동안 선택지가 다시 그려지므로 최종 상태를 기다린다.
    await waitFor(() =>
      expect(screen.getByText('✓ 등록됨 · 공개')).toBeInTheDocument(),
    );
    expect(RateApi.postRating).toHaveBeenCalledWith({
      alcoholId: 103,
      rating: 5,
    });
    await waitFor(() =>
      expect(dialogue()).toHaveTextContent(
        '리뷰는 올렸는데 별점은 저장하지 못했어요.',
      ),
    );
  });

  it('리뷰할 술을 검색해 고르면 내부 상세를 거쳐 리뷰 작성으로 이어진다', async () => {
    const lookup = vi
      .spyOn(AlcoholsApi, 'lookup')
      .mockResolvedValue([lookupItem]);
    const detail = vi
      .spyOn(AlcoholsApi, 'getAlcoholDetails')
      .mockResolvedValue({
        success: true,
        code: 200,
        data: lookupDetails,
        errors: [],
        meta,
      });
    vi.spyOn(AlcoholsApi, 'getWeeklyViewPopular').mockResolvedValue({
      success: true,
      code: 200,
      data: { totalCount: 0, alcohols: [] },
      errors: [],
      meta,
    });
    renderExperience();

    await choose('바텐더님과 함께 리뷰를 쓸게요');
    fireEvent.change(
      await screen.findByRole('searchbox', { name: '술 이름 또는 종류 검색' }),
      { target: { value: '탈리스커' } },
    );
    await press(/탈리스커 10년/);

    expect(
      await screen.findByRole('heading', { name: '탈리스커 10년' }),
    ).toBeInTheDocument();
    await press('리뷰 작성');
    expect(await screen.findByText('어떻게 남길까요')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /탈리스커 10년/ }),
    ).toBeInTheDocument();
    expect(lookup).toHaveBeenCalledWith('탈리스커', expect.anything());
    expect(detail).toHaveBeenCalledWith('900');
  });
});

describe('바텐더 노트 비로그인 행동', () => {
  const LOGIN_URL = '/login?returnTo=%2Fbartender-note';

  /** 로그인 화면으로 갔다가 로그인을 마치고 바텐더 노트로 돌아온다. */
  function returnAfterLogin(unmount: () => void) {
    unmount();
    auth.loggedIn = true;
    renderExperience();
  }

  it('리뷰 쓰기를 누르면 로그인 화면으로 가고, 로그인 후 리뷰할 술 고르기에서 이어진다', async () => {
    auth.loggedIn = false;
    const { unmount } = renderExperience();

    await choose('바텐더님과 함께 리뷰를 쓸게요');

    expect(replace).toHaveBeenCalledWith(LOGIN_URL);
    expect(trackGA4Event).toHaveBeenCalledWith('login_prompt_shown', {
      trigger: 'review_write',
    });
    returnAfterLogin(unmount);

    expect(
      await screen.findByRole('searchbox', { name: '술 이름 또는 종류 검색' }),
    ).toBeInTheDocument();
    await press('이전 단계');
    expect(
      await screen.findByRole('button', { name: /^위스키 추천해 주세요/ }),
    ).toBeInTheDocument();
  });

  it('찜한 술 보기를 누르면 로그인 화면으로 가고, 로그인 후 찜 목록을 보여 준다', async () => {
    auth.loggedIn = false;
    serverPicks = [pickItem(900, '탈리스커 10년')];
    const { unmount } = renderExperience();

    await press('찜한 술 보기');

    expect(replace).toHaveBeenCalledWith(LOGIN_URL);
    expect(MyBottleApi.getPicks).not.toHaveBeenCalled();
    returnAfterLogin(unmount);

    expect(
      await screen.findByRole('button', { name: /탈리스커 10년/ }),
    ).toBeInTheDocument();
  });

  it('찜한 술이 없으면 로그인 후 빈 찜 목록을 알리고 취향 추천으로 이어 준다', async () => {
    auth.loggedIn = false;
    const { unmount } = renderExperience();

    await press('찜한 술 보기');
    returnAfterLogin(unmount);

    expect(await screen.findByText('찜한 술이 없어요.')).toBeInTheDocument();
    expect(dialogue()).toHaveTextContent('아직 찜해 둔 술이 없네요.');
    await press('위스키 추천해 주세요');
    await choose('상관없어요');
    expect(trackGA4Event).toHaveBeenCalledWith('bartender_start', {
      entry: 'recommend',
    });
  });

  it('술 상세에서 찜을 누르면 로그인 화면으로 가고, 로그인 후 같은 술 상세로 돌아온다', async () => {
    auth.loggedIn = false;
    const { unmount } = renderExperience();
    await openHomeCurationDetail('글렌피딕 12년');

    await press('찜하기');

    expect(replace).toHaveBeenCalledWith(LOGIN_URL);
    expect(AlcoholsApi.putPick).not.toHaveBeenCalled();
    returnAfterLogin(unmount);

    expect(
      await screen.findByRole('heading', { name: '글렌피딕 12년' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '찜하기' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('술 상세에서 리뷰 작성을 누르면 로그인 화면으로 가고, 로그인 후 리뷰 방식 고르기에서 이어진다', async () => {
    auth.loggedIn = false;
    const { unmount } = renderExperience();
    await openHomeCurationDetail('글렌피딕 12년');

    await press('리뷰 작성');

    expect(replace).toHaveBeenCalledWith(LOGIN_URL);
    returnAfterLogin(unmount);

    expect(await screen.findByText('어떻게 남길까요')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /내 느낌 한 줄로 쓸게요/ }),
    ).toBeInTheDocument();
  });

  it('로그인하지 않고 돌아오면 보던 화면에 머문다', async () => {
    auth.loggedIn = false;
    const { unmount } = renderExperience();

    await choose('바텐더님과 함께 리뷰를 쓸게요');
    unmount();
    renderExperience();

    expect(
      await screen.findByRole('button', { name: /^위스키 추천해 주세요/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('searchbox', { name: '술 이름 또는 종류 검색' }),
    ).not.toBeInTheDocument();
  });

  it('로그인한 사용자는 로그인 화면을 거치지 않고 바로 다음 단계로 간다', async () => {
    renderExperience();

    await choose('바텐더님과 함께 리뷰를 쓸게요');

    expect(
      await screen.findByRole('searchbox', { name: '술 이름 또는 종류 검색' }),
    ).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});

describe('바텐더 노트 공통 이동', () => {
  it('추천 상세에 다녀와 빈 캐시로 복원해도 원래 후보로 돌아가고 결과 이벤트는 중복되지 않는다', async () => {
    const { unmount } = renderExperience();
    await answerTasteQuestions({
      kind: '싱글 몰트',
      axis: '피트·스모키',
      abv: '상관없어요',
      price: '상관없어요',
    });
    await firstPick();
    const results = () =>
      vi
        .mocked(trackGA4Event)
        .mock.calls.filter(([event]) => event === 'bartender_recommend_result');
    await waitFor(() => expect(results()).toHaveLength(1));
    expect(trackGA4Event).toHaveBeenCalledWith('bartender_recommend_result', {
      mode: 'taste',
      result_state: 'available',
    });
    await press('이 술 자세히 볼게요');
    await screen.findByRole('heading', { name: '글렌피딕 12년', level: 1 });
    expect(trackGA4Event).toHaveBeenCalledWith('bartender_select_alcohol', {
      alcohol_id: '247',
      source: 'taste',
    });
    expect(
      vi
        .mocked(trackGA4Event)
        .mock.calls.filter(
          ([event]) => event === 'bartender_open_alcohol_page',
        ),
    ).toHaveLength(0);
    fireEvent.click(screen.getByRole('link', { name: '자세히 볼게요' }));
    expect(trackGA4Event).toHaveBeenCalledWith('bartender_open_alcohol_page', {
      alcohol_id: '247',
      source: 'detail',
    });
    unmount();
    renderExperience();
    await screen.findByRole('heading', { name: '글렌피딕 12년' });
    await press('이전 단계');
    await firstPick();
    expect(results()).toHaveLength(1);
    await press('이전 질문');
    await screen.findByText('질문 5');
    await choose('1.5만 원 이하');
    await firstPick();
    await waitFor(() => expect(results()).toHaveLength(2));
  });

  it('실제 술 상세 조회가 실패해도 바텐더 안에서 재시도하고 원래 찜 목록으로 돌아갈 수 있다', async () => {
    serverPicks = [pickItem(900, '탈리스커 10년')];
    vi.mocked(AlcoholsApi.getAlcoholDetails).mockRejectedValueOnce(
      new Error('조회 실패'),
    );
    renderExperience();
    await press('찜한 술 보기');
    await press(/탈리스커 10년/);
    await screen.findByRole('alert');
    await press('다시 시도');
    await screen.findByRole('heading', { name: '탈리스커 10년' });
    await press('이전 단계');
    expect(
      await screen.findByRole('button', { name: /탈리스커 10년/ }),
    ).toBeInTheDocument();
  });

  it('술 상세 페이지에 다녀오면 보던 술 상세로 돌아오고 이전 목록으로 갈 수 있다', async () => {
    const { unmount } = renderExperience();
    await openHomeCurationDetail('글렌피딕 12년');

    fireEvent.click(screen.getByRole('link', { name: '자세히 볼게요' }));
    unmount();
    renderExperience();

    expect(
      await screen.findByRole('heading', { name: '글렌피딕 12년' }),
    ).toBeInTheDocument();
    expect(
      within(
        screen.getByRole('group', { name: '현재 단계 행동' }),
      ).getAllByRole('link', { name: '자세히 볼게요' }),
    ).toHaveLength(1);
    expect(
      within(
        screen.getByRole('group', { name: '현재 단계 행동' }),
      ).getAllByRole('button', { name: '리뷰 작성' }),
    ).toHaveLength(1);
    await press('이전 단계');
    expect(
      await screen.findByRole('button', { name: /조니워커 블랙/ }),
    ).toBeInTheDocument();
  });

  it('다른 페이지에 다녀온 지 30분이 지나면 처음 화면부터 시작한다', async () => {
    const now = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(now);
    const { unmount } = renderExperience();
    await openHomeCurationDetail('글렌피딕 12년');

    fireEvent.click(screen.getByRole('link', { name: '자세히 볼게요' }));
    unmount();
    vi.spyOn(Date, 'now').mockReturnValue(now + 31 * 60 * 1000);
    renderExperience();

    expect(
      await screen.findByRole('button', { name: /^위스키 추천해 주세요/ }),
    ).toBeInTheDocument();
  });

  it('뒤로 가기는 이전 질문으로, 닫기는 제품 홈으로 이동한다', async () => {
    renderExperience();

    await choose('위스키 추천해 주세요');
    await choose('싱글 몰트');
    expect(
      await screen.findByRole('button', { name: /^피트·스모키/ }),
    ).toBeInTheDocument();

    await press('이전 질문');
    expect(await screen.findByText('질문 1')).toBeInTheDocument();

    await press('닫기');
    expect(push).toHaveBeenCalledWith('/');
  });
});

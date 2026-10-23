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
import BartenderExperience from './BartenderExperience';
import type { Curation, Whiskey } from '../_data/demo';
import { localQuestionnaire } from '../_data/questionnaire';

const { back, push } = vi.hoisted(() => ({ back: vi.fn(), push: vi.fn() }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ back, push, replace: vi.fn() }),
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
// 바텐더 노트는 로그인한 사용자 기준으로 동작한다.
vi.mock('@/hooks/auth/useAuthSession', () => ({
  useAuthSession: () => ({
    user: { sub: 'tester', profile: null, userId: 7 },
    isLoggedIn: true,
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
        questionnaire={localQuestionnaire}
      />
    </QueryClientProvider>,
  );
}

const dialogue = () =>
  screen.getByRole('button', { name: '노트의 대사, 누르면 이어 보기' });

/** 선택지 버튼은 제목과 설명을 함께 읽으므로 제목으로 시작하는 버튼을 고른다. */
async function choose(title: string) {
  fireEvent.click(
    await screen.findByRole('button', {
      name: (name) => name === title || name.startsWith(`${title} `),
    }),
  );
}

async function press(name: string | RegExp) {
  fireEvent.click(await screen.findByRole('button', { name }));
}

async function answerTasteQuestions(answers: {
  kind: string;
  axis: string;
  abv: string;
  price: string;
}) {
  await choose('위스키 추천해 주세요');
  await choose('몇 번 마셔봤어요');
  await press('건너뛸게요');
  await choose(answers.kind);
  await choose(answers.axis);
  await choose(answers.abv);
  await choose(answers.price);
}

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
  back.mockClear();
  push.mockClear();
  window.sessionStorage.clear();
  serverPicks = [];
  stubPickApi();
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
  it('질문에 답하면 조건에 맞는 술을 추천하고 술 상세에서 추천 이유를 보여 준다', async () => {
    renderExperience();

    await choose('위스키 추천해 주세요');
    expect(await screen.findByText('질문 1 / 6')).toBeInTheDocument();
    await choose('몇 번 마셔봤어요');
    await press('건너뛸게요');
    await choose('싱글 몰트');
    await choose('피트·스모키');
    await choose('상관없어요');
    expect(screen.getByText('질문 6 / 6')).toBeInTheDocument();
    await choose('상관없어요');

    expect(await screen.findByText('추천 2병')).toBeInTheDocument();
    expect(dialogue()).toHaveTextContent('조건에 맞는 병 2병을 골랐습니다.');
    const rows = screen.getAllByRole('button', { name: /10년/ });
    expect(rows.map((row) => row.textContent)).toEqual([
      expect.stringContaining('아드벡 10년'),
      expect.stringContaining('라프로익 10년'),
    ]);

    await press(/라프로익 10년/);

    expect(
      await screen.findByRole('heading', { name: '라프로익 10년' }),
    ).toBeInTheDocument();
    expect(dialogue()).toHaveTextContent(
      '피트·스모키 향이 있어 고르신 결에 맞아요.',
    );
    expect(screen.getByRole('link', { name: '자세히 볼게요' })).toHaveAttribute(
      'href',
      '/alcohols/101',
    );
  });

  it('조건에 맞는 술이 없으면 이전 단계로 예산을 바꿔 다시 추천받는다', async () => {
    renderExperience();

    await answerTasteQuestions({
      kind: '상관없어요',
      axis: '상관없어요',
      abv: '상관없어요',
      price: '4만 원 이상',
    });

    expect(await screen.findByText('추천할 술이 없어요')).toBeInTheDocument();
    expect(
      screen.getByText('보여 드릴 병이 없어요. 조건을 바꿔 다시 골라 볼까요?'),
    ).toBeInTheDocument();

    await press('이전 단계');
    expect(await screen.findByText('질문 6 / 6')).toBeInTheDocument();
    await choose('상관없어요');

    expect(await screen.findByText('추천 5병')).toBeInTheDocument();
  });

  it('마셔본 술을 검색해 고르면 그 술을 기준으로 향을 묻는다', async () => {
    const lookup = vi
      .spyOn(AlcoholsApi, 'lookup')
      .mockResolvedValue([lookupItem]);
    renderExperience();

    await choose('위스키 추천해 주세요');
    await choose('자주 마시는 편이에요');
    fireEvent.change(
      await screen.findByRole('searchbox', { name: '마셔본 술 이름 검색' }),
      { target: { value: '탈리스커' } },
    );
    await press(/탈리스커 10년.*Talisker 10/);

    expect(lookup).toHaveBeenCalledWith('탈리스커', expect.anything());
    expect(
      await screen.findByRole('button', { name: '탈리스커 10년 ×' }),
    ).toBeInTheDocument();
    expect(screen.getByText('1/3병 · 선택 사항')).toBeInTheDocument();

    await press('이 술을 기억할게요');
    await choose('싱글 몰트');

    expect(dialogue()).toHaveTextContent(
      '「탈리스커 10년」을 기준으로 잡을게요.',
    );
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

    expect(await screen.findByText('질문 1 / 6')).toBeInTheDocument();
  });
});

describe('바텐더 노트 찜', () => {
  it('술 상세에서 찜하면 서버에 저장하고 처음 화면의 찜 목록에서 다시 볼 수 있다', async () => {
    renderExperience();
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
    await press('찜한 술 1병 보기');
    await press(/글렌피딕 12년/);

    expect(
      await screen.findByRole('heading', { name: '글렌피딕 12년' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '찜 취소' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('데모에 없는 찜한 술은 실제 술 상세 페이지로 연결한다', async () => {
    serverPicks = [
      pickItem(900, '탈리스커 10년'),
      pickItem(104, '조니워커 블랙', '블렌디드'),
    ];
    renderExperience();

    await press('찜한 술 2병 보기');

    expect(
      await screen.findByRole('link', { name: /탈리스커 10년/ }),
    ).toHaveAttribute('href', '/alcohols/900');
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

  it('첫 화면에서 리뷰를 시작하면 술을 검색해 고른 뒤 작성 방식을 묻는다', async () => {
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

    expect(await screen.findByText('어떻게 남길까요')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /탈리스커 10년/ }),
    ).toBeInTheDocument();
    expect(lookup).toHaveBeenCalledWith('탈리스커', expect.anything());
    expect(detail).toHaveBeenCalledWith('900');
  });
});

describe('바텐더 노트 공통 이동', () => {
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

  it('뒤로 가기는 이전 질문으로, 닫기는 처음 화면으로 돌아간다', async () => {
    renderExperience();

    await choose('위스키 추천해 주세요');
    await choose('몇 번 마셔봤어요');
    expect(
      await screen.findByRole('searchbox', { name: '마셔본 술 이름 검색' }),
    ).toBeInTheDocument();

    await press('이전 질문');
    expect(await screen.findByText('질문 1 / 6')).toBeInTheDocument();

    await press('닫기');
    expect(
      await screen.findByRole('button', { name: /^위스키 추천해 주세요/ }),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole('group', { name: '현재 단계 행동' })).queryByRole(
        'button',
      ),
    ).not.toBeInTheDocument();
  });
});

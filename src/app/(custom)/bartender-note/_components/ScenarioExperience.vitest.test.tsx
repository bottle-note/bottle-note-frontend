import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import {
  ScenarioApi,
  type ScenarioResponse,
  type ScenarioRequest,
} from '@/api/scenario/scenario.api';
import { ApiError } from '@/utils/ApiError';
import ScenarioExperience from './ScenarioExperience';

const { auth, track } = vi.hoisted(() => ({
  auth: { user: { userId: 7 } as { userId: number } | null, isLoading: false },
  track: vi.fn(),
}));
vi.mock('@/hooks/auth/useAuthSession', () => ({ useAuthSession: () => auth }));
vi.mock('@/api/campaign-content/campaign-content.api', () => ({
  trackCampaignEvent: track,
}));
vi.mock('@/api/scenario/scenario.api', () => ({
  ScenarioApi: { get: vi.fn(), evaluate: vi.fn() },
}));
vi.mock('@/components/domain/auth/LoginModal', () => ({
  default: () => <p>로그인 안내</p>,
}));
vi.mock('./BartenderFrame', () => ({
  default: ({
    lines,
    children,
    onBack,
    onClose,
    backLabel,
  }: {
    lines: string[];
    children: ReactNode;
    onBack: () => void;
    onClose: () => void;
    backLabel: string;
  }) => (
    <main>
      <h1>{lines.join(' ')}</h1>
      <section>{children}</section>
      <button onClick={onBack}>{backLabel ?? '이전 질문'}</button>
      <button onClick={onClose}>닫기</button>
    </main>
  ),
}));

const firstQuestion = {
  questionId: 11,
  title: '경험을 알려주세요',
  options: [
    {
      optionId: 'signed-choice',
      label: '처음 마셔요',
      kind: 'CHOICE' as const,
      candidateCount: 5,
      selectable: true,
    },
    {
      optionId: 'signed-any',
      label: '상관없어요',
      kind: 'ANY' as const,
      candidateCount: 25,
      selectable: true,
    },
  ],
};
const secondQuestion = {
  questionId: 22,
  title: '예산을 골라주세요',
  options: [
    {
      optionId: 'signed-numeric-predicate',
      label: '13000원 초과 ~ 15000원 이하',
      kind: 'NUMBER_RANGE' as const,
      candidateCount: 3,
      selectable: true,
    },
  ],
};
function response(request?: ScenarioRequest): ScenarioResponse {
  const answers = request?.answers ?? [];
  const result = request?.mode === 'RESULT';
  const past = request?.viewQuestionId === 11;
  const total = answers.length ? 5 : 25;
  const content = result
    ? Array.from(
        { length: request?.cursor ? 5 : Math.min(total, 20) },
        (_, i) => ({
          alcoholId: (request?.cursor ? 20 : 0) + i + 100,
          korName: `실제 API 후보 ${i + 1}`,
          engName: 'Whisky',
          imageUrl: null,
          korCategory: '싱글몰트',
          abv: '40%',
        }),
      )
    : [];
  return {
    scenarioId: 3,
    title: '추천',
    versionId: 1,
    state: result ? 'USER_FINISHED' : 'QUESTION',
    nextQuestionId: answers.length ? 22 : 11,
    path: answers.length ? [11, 22] : [11],
    answers: answers.map((a) => ({
      ...a,
      label: a.optionId === 'signed-choice' ? '처음 마셔요' : '상관없어요',
      applied: !past,
    })),
    question: result
      ? null
      : past || !answers.length
        ? firstQuestion
        : secondQuestion,
    candidateCount: past ? 25 : total,
    candidates: {
      content,
      pagination: {
        hasNext: result && total > 20 && !request?.cursor,
        nextCursor:
          result && total > 20 && !request?.cursor ? 'signed-page' : null,
      },
    },
  };
}
function mount() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <ScenarioExperience onExit={vi.fn()} onLeave={vi.fn()} />
    </QueryClientProvider>,
  );
}
async function choose(label: string) {
  fireEvent.click(
    await screen.findByRole('button', { name: new RegExp(`^${label}`) }),
  );
}
const campaign = 'bartender-note-type-d';
beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
  auth.user = { userId: 7 };
  vi.mocked(ScenarioApi.get).mockResolvedValue(response());
  vi.mocked(ScenarioApi.evaluate).mockImplementation(async (_, r) =>
    response(r),
  );
});
afterEach(cleanup);

describe('실제 시나리오 계약을 쓰는 네 번째 추천', () => {
  it('삭제된 시나리오의 저장 답변을 사용하지 않고 새 단일 시나리오를 조회한다', async () => {
    localStorage.setItem(
      `bartender-note:${campaign}:1:user:7`,
      JSON.stringify({
        owner: 'user:7',
        scenarioId: 1,
        versionId: 1,
        answers: [{ questionId: 1, optionId: 'old-option' }],
        mode: 'RESULT',
        scrollTop: 0,
        questionTitles: {},
        started: true,
        finished: true,
        resultShown: true,
      }),
    );
    mount();
    expect(
      await screen.findByRole('button', { name: /^처음 마셔요/ }),
    ).toBeInTheDocument();
    expect(ScenarioApi.get).toHaveBeenCalledWith(3, expect.anything());
    expect(ScenarioApi.evaluate).not.toHaveBeenCalled();
  });

  it('서버의 선택지 ID만 보내고 갱신 중에는 현재 질문을 유지하며 중복 클릭을 막는다', async () => {
    let resolve!: (r: ScenarioResponse) => void;
    vi.mocked(ScenarioApi.evaluate).mockImplementationOnce(
      () =>
        new Promise((r) => {
          resolve = r;
        }),
    );
    mount();
    await choose('처음 마셔요');
    await waitFor(() =>
      expect(ScenarioApi.evaluate).toHaveBeenCalledWith(
        3,
        expect.objectContaining({
          versionId: 1,
          answers: [{ questionId: 11, optionId: 'signed-choice' }],
        }),
        expect.anything(),
      ),
    );
    expect(screen.getByRole('heading')).toHaveTextContent('경험을 알려주세요');
    expect(screen.getByRole('button', { name: /^처음 마셔요/ })).toBeDisabled();
    resolve(
      response({
        versionId: 1,
        answers: [{ questionId: 11, optionId: 'signed-choice' }],
        mode: 'QUESTION',
      }),
    );
    expect(
      await screen.findByRole('button', { name: /^13000원 초과/ }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
  });

  it('중간 종료와 추가 페이지는 같은 평가 API를 쓰고 이벤트를 중복 기록하지 않는다', async () => {
    mount();
    await choose('바로 추천받을래요');
    expect(await screen.findByText('추천 25병')).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(20);
    await choose('추천 더 볼게요');
    await waitFor(() => expect(screen.getAllByRole('link')).toHaveLength(25));
    expect(ScenarioApi.evaluate).toHaveBeenCalledWith(
      3,
      expect.objectContaining({
        mode: 'RESULT',
        answers: [],
        cursor: 'signed-page',
      }),
      expect.anything(),
    );
    for (const event of ['START', 'FINISH', 'RESULT'])
      expect(
        track.mock.calls.filter((c) => c[0] === campaign && c[1] === event),
      ).toHaveLength(1);
    await choose('질문을 더 볼게요');
    expect(
      await screen.findByRole('button', { name: /^처음 마셔요/ }),
    ).toBeInTheDocument();
    await choose('바로 추천받을래요');
    await screen.findByText('추천 25병');
    expect(track.mock.calls.filter((c) => c[1] === 'RESULT')).toHaveLength(1);
  });

  it('과거 질문에서 바로 종료하면 그 질문 이후 답변을 폐기한다', async () => {
    mount();
    await choose('처음 마셔요');
    await screen.findByText('예산을 골라주세요');
    await choose('이전 질문');
    await screen.findByText('경험을 알려주세요');
    await choose('바로 추천받을래요');
    expect(await screen.findByText('추천 25병')).toBeInTheDocument();
    expect(ScenarioApi.evaluate).toHaveBeenLastCalledWith(
      3,
      expect.objectContaining({
        mode: 'RESULT',
        answers: [],
        viewQuestionId: undefined,
      }),
      expect.anything(),
    );
  });

  it('Local Storage 답변을 재평가해 최신 후보 수로 복귀하고 참여 이벤트는 반복하지 않는다', async () => {
    const view = mount();
    await choose('처음 마셔요');
    await screen.findByText('예산을 골라주세요');
    await choose('바로 추천받을래요');
    await screen.findByText('추천 5병');
    await waitFor(() =>
      expect(
        JSON.parse(localStorage.getItem(`bartender-note:${campaign}:3:user:7`)!)
          .mode,
      ).toBe('RESULT'),
    );
    view.unmount();
    vi.mocked(ScenarioApi.evaluate).mockImplementation(async (_, r) => ({
      ...response(r),
      candidateCount: 4,
    }));
    mount();
    expect(await screen.findByText('추천 4병')).toBeInTheDocument();
    expect(track.mock.calls.filter((c) => c[1] === 'START')).toHaveLength(1);
    expect(track.mock.calls.filter((c) => c[1] === 'RESULT')).toHaveLength(1);
  });

  it('저장한 정의의 버전 충돌은 샘플 결과 대신 복구 화면을 보여준다', async () => {
    localStorage.setItem(
      `bartender-note:${campaign}:3:user:7`,
      JSON.stringify({
        owner: 'user:7',
        scenarioId: 3,
        versionId: 1,
        answers: [],
        mode: 'RESULT',
        scrollTop: 0,
        questionTitles: {},
        started: true,
        finished: true,
        resultShown: true,
      }),
    );
    vi.mocked(ScenarioApi.evaluate).mockRejectedValue(
      new ApiError(
        'changed',
        new Response(null, { status: 409 }),
        'SCENARIO_CONFLICT',
      ),
    );
    mount();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      '추천 질문이 바뀌었거나',
    );
    await choose('처음부터 다시 선택할게요');
    expect(
      await screen.findByRole('button', { name: /^처음 마셔요/ }),
    ).toBeInTheDocument();
    expect(track).not.toHaveBeenCalledWith(campaign, 'START');
  });

  it('비회원은 완료만 기록하고 로그인 전에 추천 결과나 RESULT를 노출하지 않는다', async () => {
    auth.user = null;
    mount();
    await choose('바로 추천받을래요');
    await screen.findByText(
      '로그인하면 지금까지 고른 조건으로 추천을 이어볼 수 있어요.',
    );
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(track).toHaveBeenCalledWith(campaign, 'FINISH');
    expect(track).not.toHaveBeenCalledWith(campaign, 'RESULT');
    await choose('로그인하고 추천 볼게요');
    expect(sessionStorage.getItem('bartender-note:scenario-login')).toContain(
      'guest',
    );
  });

  it('다른 계정에는 이전 계정의 저장 답변을 복원하지 않는다', async () => {
    const view = mount();
    await choose('처음 마셔요');
    await screen.findByText('예산을 골라주세요');
    await choose('바로 추천받을래요');
    await screen.findByText('추천 5병');
    view.unmount();
    auth.user = { userId: 8 };
    mount();
    expect(
      await screen.findByRole('button', { name: /^처음 마셔요/ }),
    ).toBeInTheDocument();
    expect(screen.queryByText('추천 5병')).not.toBeInTheDocument();
  });
  it('서버 END에서는 결과를 보여주고 마지막 질문으로 돌아갈 수 있다', async () => {
    vi.mocked(ScenarioApi.evaluate).mockImplementation(async (_, r) => {
      if (r.answers.length === 2 && !r.viewQuestionId) {
        const value = response({ ...r, mode: 'RESULT' });
        return {
          ...value,
          state: 'SCENARIO_END',
          nextQuestionId: null,
          candidateCount: 3,
          candidates: {
            content: value.candidates.content.slice(0, 3),
            pagination: { hasNext: false, nextCursor: null },
          },
        };
      }
      return response(r);
    });
    mount();
    await choose('처음 마셔요');
    await choose('13000원 초과');
    expect(await screen.findByText('추천 3병')).toBeInTheDocument();
    expect(ScenarioApi.evaluate).toHaveBeenLastCalledWith(
      3,
      expect.objectContaining({
        answers: [
          { questionId: 11, optionId: 'signed-choice' },
          { questionId: 22, optionId: 'signed-numeric-predicate' },
        ],
      }),
      expect.anything(),
    );
    await choose('이전 질문');
    expect(await screen.findByText('예산을 골라주세요')).toBeInTheDocument();
  });

  it('사용자가 로그인하려고 넘긴 비회원 진행만 로그인 계정으로 이어받는다', async () => {
    auth.user = null;
    const view = mount();
    await choose('처음 마셔요');
    await screen.findByText('예산을 골라주세요');
    await choose('바로 추천받을래요');
    await choose('로그인하고 추천 볼게요');
    view.unmount();
    auth.user = { userId: 7 };
    mount();
    expect(await screen.findByText('추천 5병')).toBeInTheDocument();
    expect(sessionStorage.getItem('bartender-note:scenario-login')).toBeNull();
    expect(track.mock.calls.filter((c) => c[1] === 'START')).toHaveLength(1);
    expect(track.mock.calls.filter((c) => c[1] === 'FINISH')).toHaveLength(1);
    expect(track.mock.calls.filter((c) => c[1] === 'RESULT')).toHaveLength(1);
  });
  it('추가 조회 뒤 복원하면 페이지 수도 현재 서버 데이터로 다시 채운다', async () => {
    const view = mount();
    await choose('바로 추천받을래요');
    await screen.findByText('추천 25병');
    await choose('추천 더 볼게요');
    await waitFor(() => expect(screen.getAllByRole('link')).toHaveLength(25));
    await waitFor(() =>
      expect(
        JSON.parse(localStorage.getItem(`bartender-note:${campaign}:3:user:7`)!)
          .pageCount,
      ).toBe(2),
    );
    view.unmount();
    mount();
    await waitFor(() => expect(screen.getAllByRole('link')).toHaveLength(25));
  });
});

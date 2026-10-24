import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MOCK_SCENARIO_CONTEXT } from './mockScenario';
import type { ScenarioAnswer } from './model';
import * as scenarioApi from './scenarioApi';
import { useScenarioFlow } from './useScenarioFlow';

interface ScenarioHarnessProps {
  active?: boolean;
  savedAnswers?: ScenarioAnswer[];
}

/** Phase 2 hook의 소비자 검증용 화면. 실제 바텐더 화면은 Phase 3~4에서 연결한다. */
function ScenarioHarness({
  active = true,
  savedAnswers = [],
}: ScenarioHarnessProps) {
  const flow = useScenarioFlow({ context: MOCK_SCENARIO_CONTEXT, active });
  const { data } = flow.query;
  const question = data?.question;
  const input = question?.input;

  return (
    <>
      {!active && <p>시나리오 대기 중</p>}
      {active && (
        <>
          {flow.query.isFetching && <p role="status">질문을 불러오는 중</p>}
          {flow.query.isError && (
            <div role="alert">
              질문을 불러오지 못했어요
              <button type="button" onClick={() => void flow.retry()}>
                다시 시도
              </button>
            </div>
          )}
          {question && <h1>{question.prompt}</h1>}
          {input?.kind === 'choice' && (
            <>
              {input.options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  disabled={!flow.canAnswer}
                  onClick={() =>
                    flow.answer({ kind: 'choice', choiceId: option.id })
                  }
                >
                  {option.label}
                </button>
              ))}
              {input.allowAny && (
                <button
                  type="button"
                  disabled={!flow.canAnswer}
                  onClick={() => flow.answer({ kind: 'any' })}
                >
                  상관없어요
                </button>
              )}
            </>
          )}
          {input?.kind === 'alcohol-select' && (
            <button
              type="button"
              disabled={!flow.canAnswer}
              onClick={() => flow.answer({ kind: 'alcohols', alcoholIds: [] })}
            >
              건너뛰기
            </button>
          )}
          {input?.kind === 'price-select' &&
            input.units.map((unit) => (
              <div key={unit.unit}>
                {unit.options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    disabled={!flow.canAnswer}
                    onClick={() =>
                      flow.answer({
                        kind: 'price',
                        unit: unit.unit,
                        selection: { kind: 'choice', choiceId: option.id },
                      })
                    }
                  >
                    {unit.label} · {option.label}
                  </button>
                ))}
                {input.allowAny && (
                  <button
                    type="button"
                    disabled={!flow.canAnswer}
                    onClick={() =>
                      flow.answer({
                        kind: 'price',
                        unit: unit.unit,
                        selection: { kind: 'any' },
                      })
                    }
                  >
                    {unit.label} · 상관없어요
                  </button>
                )}
              </div>
            ))}
          {data?.completed && (
            <>
              <h1>추천 완료</h1>
              {data.candidates?.items.map((candidate) => (
                <p key={candidate.id}>{candidate.name}</p>
              ))}
              {data.candidates?.totalCount === 0 && <p>추천 후보가 없어요</p>}
            </>
          )}
        </>
      )}
      <button type="button" disabled={!flow.canGoBack} onClick={flow.back}>
        이전 질문
      </button>
      <button type="button" onClick={flow.reset}>
        처음부터
      </button>
      <button type="button" onClick={() => flow.restore(savedAnswers)}>
        저장한 답변 복원
      </button>
    </>
  );
}

function renderScenario(props: ScenarioHarnessProps = {}) {
  const client = new QueryClient({
    defaultOptions: { queries: { gcTime: Infinity } },
  });
  const view = render(
    <QueryClientProvider client={client}>
      <ScenarioHarness {...props} />
    </QueryClientProvider>,
  );
  return {
    ...view,
    rerenderScenario: (next: ScenarioHarnessProps) =>
      view.rerender(
        <QueryClientProvider client={client}>
          <ScenarioHarness {...next} />
        </QueryClientProvider>,
      ),
  };
}

async function choose(name: string) {
  const button = await screen.findByRole('button', { name });
  await waitFor(() => expect(button).toBeEnabled());
  fireEvent.click(button);
}

async function reachKinds() {
  await choose('위스키 잘 몰라요');
  await choose('건너뛰기');
}

afterEach(() => vi.restoreAllMocks());

describe('시나리오 진행 hook의 소비자 흐름', () => {
  it('비활성 상태에서는 조회하지 않고 진입한 뒤 첫 질문을 표시한다', async () => {
    const request = vi.spyOn(scenarioApi, 'getScenarioStep');
    const { rerenderScenario } = renderScenario({ active: false });
    expect(screen.getByText('시나리오 대기 중')).toBeInTheDocument();
    expect(request).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: '이전 질문' })).toBeDisabled();

    rerenderScenario({ active: true });
    await screen.findByRole('button', { name: '위스키 잘 몰라요' });
    expect(request).toHaveBeenCalledTimes(1);
    rerenderScenario({ active: false });
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('답변을 순서대로 고르면 후보를 표시하고 완료 뒤 이전 질문으로 돌아갈 수 있다', async () => {
    renderScenario();
    await reachKinds();
    await choose('버번');
    await choose('부드러운·밀');
    await choose('44~46% · 적당히');
    await choose('병으로 살 때 · 5~10만 원');
    await screen.findByRole('heading', { name: '추천 완료' });
    expect(screen.getByText('메이커스 마크')).toBeInTheDocument();

    await choose('이전 질문');
    await choose('바에서 한 잔 · 상관없어요');
    await screen.findByRole('heading', { name: '추천 완료' });
    expect(screen.getByText('메이커스 마크')).toBeInTheDocument();
  });

  it('이전 질문의 종류를 바꾸면 새 향 보기를 표시하고 처음부터 다시 시작할 수 있다', async () => {
    renderScenario();
    await reachKinds();
    await choose('버번');
    await screen.findByRole('button', { name: '부드러운·밀' });
    await choose('이전 질문');
    await choose('라이');
    await screen.findByRole('button', { name: '스파이시·호밀' });
    expect(
      screen.queryByRole('button', { name: '부드러운·밀' }),
    ).not.toBeInTheDocument();
    await choose('상관없어요');
    await choose('상관없어요');
    await choose('바에서 한 잔 · 상관없어요');
    await screen.findByText('추천 후보가 없어요');

    await choose('처음부터');
    await screen.findByRole('button', { name: '위스키 잘 몰라요' });
    expect(screen.getByRole('button', { name: '이전 질문' })).toBeDisabled();
  });

  it('조회 실패 후 다시 시도하면 답변을 유지한 채 다음 질문을 받는다', async () => {
    const request = vi.spyOn(scenarioApi, 'getScenarioStep');
    renderScenario();
    await screen.findByRole('button', { name: '위스키 잘 몰라요' });
    request.mockRejectedValueOnce(new Error('조회 실패'));
    await choose('위스키 잘 몰라요');
    await screen.findByRole('alert');
    expect(
      screen.queryByRole('button', { name: '위스키 잘 몰라요' }),
    ).not.toBeInTheDocument();
    expect(request).toHaveBeenCalledTimes(2);

    await choose('다시 시도');
    await screen.findByRole('button', { name: '건너뛰기' });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('Query 캐시가 없는 새 화면에서도 저장한 답변을 복원해 이어 간다', async () => {
    const savedAnswers: ScenarioAnswer[] = [
      { questionId: 101, value: { kind: 'choice', choiceId: 'beginner' } },
      { questionId: 102, value: { kind: 'alcohols', alcoholIds: [] } },
      { questionId: 103, value: { kind: 'choice', choiceId: 'bourbon' } },
    ];
    const { rerenderScenario } = renderScenario({
      active: false,
      savedAnswers,
    });
    await choose('저장한 답변 복원');
    rerenderScenario({ active: true, savedAnswers });
    await screen.findByRole('button', { name: '부드러운·밀' });
    expect(
      screen.queryByRole('button', { name: '위스키 잘 몰라요' }),
    ).not.toBeInTheDocument();
    await choose('이전 질문');
    await screen.findByRole('button', { name: '라이' });
  });
});

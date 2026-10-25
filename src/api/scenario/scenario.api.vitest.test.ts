import { afterEach, describe, expect, it, vi } from 'vitest';
import { ScenarioApi } from './scenario.api';

afterEach(() => vi.restoreAllMocks());

describe('Product 시나리오 HTTP 연결', () => {
  it('공개 GET의 data를 반환하고 취소 signal을 전달한다', async () => {
    const data = { scenarioId: 3, versionId: 7 };
    const fetch = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(JSON.stringify({ success: true, data, errors: [] })),
      );
    const controller = new AbortController();
    await expect(ScenarioApi.get(3, controller.signal)).resolves.toEqual(data);
    expect(fetch).toHaveBeenCalledWith(
      '/bottle-api/v1/scenarios/3',
      expect.objectContaining({ method: 'GET', signal: controller.signal }),
    );
  });

  it('평가 POST의 버전·순서·서명된 optionId를 그대로 전송한다', async () => {
    const fetch = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(JSON.stringify({ success: true, data: {}, errors: [] })),
      );
    const request = {
      versionId: 7,
      answers: [
        { questionId: 11, optionId: 'signed.first.option' },
        { questionId: 13, optionId: 'signed.second.option' },
      ],
      mode: 'QUESTION' as const,
    };
    await ScenarioApi.evaluate(3, request);
    expect(fetch).toHaveBeenCalledWith(
      '/bottle-api/v1/scenarios/3/evaluate',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(request),
      }),
    );
  });

  it('버전 충돌 상태를 보존해서 화면이 재시작을 안내하게 한다', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          errors: [{ code: 'VERSION_CONFLICT', message: '게시 버전 변경' }],
        }),
        { status: 409 },
      ),
    );
    await expect(
      ScenarioApi.evaluate(3, {
        versionId: 7,
        answers: [],
        mode: 'QUESTION',
      }),
    ).rejects.toMatchObject({ response: { status: 409 } });
  });
});

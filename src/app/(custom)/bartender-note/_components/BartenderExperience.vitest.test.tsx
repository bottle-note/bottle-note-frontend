import { StrictMode } from 'react';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BartenderExperience from './BartenderExperience';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => '/bartender-note',
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock('framer-motion', () => ({ useReducedMotion: () => true }));
// Canvas/image decoding is exercised in the browser; interaction tests use the real dialogue and forms.
vi.mock('./BartenderScene', () => ({
  default: () => <div aria-label="바텐더 장면" />,
}));
vi.mock('next/image', () => ({
  default: ({ quality, priority, ...props }: any) => <img {...props} />,
}));

async function click(name: string | RegExp) {
  fireEvent.click(screen.getByRole('button', { name }));
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 20));
  });
}

function mount() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  const result = render(
    <StrictMode>
      <QueryClientProvider client={client}>
        <BartenderExperience />
      </QueryClientProvider>
    </StrictMode>,
  );
  return { ...result, client };
}

beforeEach(() => {
  vi.stubGlobal('scrollTo', vi.fn());
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) =>
    window.setTimeout(() => callback(performance.now()), 0),
  );
  vi.stubGlobal('cancelAnimationFrame', window.clearTimeout);
  let count = 0;
  URL.createObjectURL = vi.fn(() => `blob:preview-${++count}`);
  URL.revokeObjectURL = vi.fn();
  window.history.replaceState({}, '', '/bartender-note');
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('바텐더 노트 화면 흐름', () => {
  it('취향 선택을 보존해 이전 단계로 돌아가고 추천 후보의 찜을 토글한다', async () => {
    const { client } = mount();
    await click(/제 취향에 맞는 술/);
    await click(/몇 병 마셔 봤어요/);
    await click(/버팔로 트레이스버번|버팔로 트레이스/);
    await click('이 술들로 찾아주세요');
    await click('이전 단계');
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: '괜찮았던 위스키가 있나요?' }),
      ).toBeVisible(),
    );
    expect(
      screen.getByRole('button', { name: '버팔로 트레이스 선택 해제' }),
    ).toBeVisible();
    await click('이 술들로 찾아주세요');
    await click(/싱글 몰트 한 증류소/);
    await click(/피트·스모키/);
    await click(/44~46%/);
    await click('1.5~2.5만 원');
    expect(screen.getByRole('status')).toHaveTextContent(
      '한 잔을 고르고 있어요',
    );
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /조니워커 블랙/ }),
      ).toBeVisible(),
    );
    expect(
      screen.getByText(/선택한 조건에 따른 실제 추천은 추후/),
    ).toBeVisible();
    await click(/조니워커 블랙/);
    await click('찜 동작 미리보기');
    expect(
      screen.getByRole('button', { name: '찜 선택됨 · 취소하기' }),
    ).toHaveAttribute('aria-pressed', 'true');
    await click('찜 선택됨 · 취소하기');
    expect(
      screen.getByRole('button', { name: '찜 동작 미리보기' }),
    ).toHaveAttribute('aria-pressed', 'false');
    client.clear();
  });

  it('사진·본문·가격·공개 범위를 수정 왕복 중 유지하고 다음 잔에는 장소만 이어 쓴다', async () => {
    const { container, client } = mount();
    await click(/바텐더님과 함께 리뷰/);
    await click(/조니워커 블랙/);
    expect(
      screen.getByRole('button', { name: '이 점수로 할게요' }),
    ).toBeDisabled();
    const rating = screen.getByRole('slider', { name: '내 별점' });
    fireEvent.keyDown(rating, { key: 'End' });
    fireEvent.keyUp(rating, { key: 'End' });
    await click('이 점수로 할게요');
    await click('바닐라');
    await click('다 골랐어요');
    expect(screen.getByRole('button', { name: '다 썼어요' })).toBeDisabled();
    fireEvent.change(screen.getByRole('textbox', { name: '리뷰 본문' }), {
      target: { value: '향이 부드러워 편하게 즐겼다.' },
    });
    await click('다 썼어요');
    fireEvent.change(screen.getByRole('textbox', { name: /장소/ }), {
      target: { value: '노트 바' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: '가격 (원)' }), {
      target: { value: '15000' },
    });
    const file = new File(['photo'], 'glass.webp', { type: 'image/webp' });
    fireEvent.change(container.querySelector('input[type=file]')!, {
      target: { files: [file] },
    });
    await waitFor(() =>
      expect(screen.getByRole('img', { name: '첨부 사진 1' })).toBeVisible(),
    );
    await click('기록 미리보기');
    fireEvent.click(screen.getByRole('radio', { name: '비공개' }));
    await click('본문 수정');
    expect(screen.getByRole('textbox', { name: '리뷰 본문' })).toHaveValue(
      '향이 부드러워 편하게 즐겼다.',
    );
    await click('다 썼어요');
    expect(screen.getByRole('textbox', { name: /장소/ })).toHaveValue(
      '노트 바',
    );
    expect(screen.getByRole('textbox', { name: '가격 (원)' })).toHaveValue(
      '15000',
    );
    expect(screen.getByRole('img', { name: '첨부 사진 1' })).toBeVisible();
    await click('기록 미리보기');
    const preview = screen.getByRole('article', {
      name: '작성한 리뷰 미리보기',
    });
    expect(preview).toHaveTextContent('내 별점 ★ 5.0 · 비공개');
    expect(within(preview).getAllByRole('img')).toHaveLength(1);
    await click('이 기록으로 완료해 볼게요');
    expect(
      screen.getByText(
        '실제 리뷰는 등록되지 않았어요. 한 잔 더 기록하면 장소를 이어서 채워 드려요.',
      ),
    ).toBeVisible();
    await click('다른 술도 기록할게요');
    await click(/버팔로 트레이스/);
    const nextRating = screen.getByRole('slider', { name: '내 별점' });
    expect(nextRating).toHaveValue('0');
    fireEvent.keyDown(nextRating, { key: 'End' });
    fireEvent.keyUp(nextRating, { key: 'End' });
    await click('이 점수로 할게요');
    await click('태그 없이 넘어갈게요');
    expect(screen.getByRole('textbox', { name: '리뷰 본문' })).toHaveValue('');
    fireEvent.change(screen.getByRole('textbox', { name: '리뷰 본문' }), {
      target: { value: '두 번째 한 잔.' },
    });
    await click('다 썼어요');
    expect(screen.getByRole('textbox', { name: /장소/ })).toHaveValue(
      '노트 바',
    );
    expect(screen.getByRole('textbox', { name: '가격 (원)' })).toHaveValue('');
    expect(
      screen.queryByRole('img', { name: '첨부 사진 1' }),
    ).not.toBeInTheDocument();
    client.clear();
  });

  it('상황별 큐레이션을 골라 예시 목록을 확인한다', async () => {
    const { client } = mount();
    await click(/상황에 맞게 추천/);
    await click(/바에서 마실 한 잔/);
    await click(/스모키한 향을 따라/);
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /포트 샬롯 10년/ }),
      ).toBeVisible(),
    );
    expect(screen.getByText('스모키한 향을 따라')).toBeVisible();
    expect(
      screen.queryByRole('button', { name: /버팔로 트레이스/ }),
    ).not.toBeInTheDocument();
    client.clear();
  });
});

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AlcoholsApi } from '@/api/alcohol/alcohol.api';
import type { AlcoholLookupItem } from '@/api/alcohol/types';
import LikesStep from './LikesStep';

const meta = {
  serverEncoding: 'UTF-8',
  serverVersion: '1.0.0',
  serverPathVersion: 'v1',
  serverResponseTime: '',
};

const item = (alcoholId: number, korName: string): AlcoholLookupItem => ({
  alcoholId,
  korName,
  engName: '',
  imageUrl: '',
  korCategoryName: '싱글 몰트',
  engCategoryName: 'Single Malt',
  categoryGroup: 'SINGLE_MALT',
  korRegion: '',
  engRegion: '',
  korDistillery: '',
  engDistillery: '',
  regionId: 1,
  distilleryId: 1,
});

/** 술 이름 검색(/alcohols/lookup) 한 페이지 응답. nextCursor가 있으면 다음 페이지가 있다. */
const lookupResponse = (
  items: AlcoholLookupItem[],
  nextCursor: string | null = null,
) => ({
  success: true,
  code: 200,
  data: { items },
  errors: [],
  meta: { ...meta, pagination: { hasNext: nextCursor !== null, nextCursor } },
});

/** 목록 끝 감지 요소를 지켜보는 IntersectionObserver 대역. scrollToEnd로 화면에 들어온 것처럼 알린다. */
const observers = new Set<{
  callback: IntersectionObserverCallback;
  targets: Set<Element>;
}>();
class FakeIntersectionObserver {
  private entry = {
    callback: (() => {}) as IntersectionObserverCallback,
    targets: new Set<Element>(),
  };

  constructor(callback: IntersectionObserverCallback) {
    this.entry.callback = callback;
    observers.add(this.entry);
  }

  observe = (target: Element) => this.entry.targets.add(target);

  unobserve = (target: Element) => this.entry.targets.delete(target);

  disconnect = () => observers.delete(this.entry);
}

function scrollToEnd() {
  observers.forEach(({ callback, targets }) =>
    targets.forEach((target) =>
      callback(
        [{ isIntersecting: true, target } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      ),
    ),
  );
}

function renderLikes(onAnswer = vi.fn()) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <LikesStep maxSelections={3} disabled={false} onAnswer={onAnswer} />
    </QueryClientProvider>,
  );
  return onAnswer;
}

beforeEach(() => {
  vi.restoreAllMocks();
  observers.clear();
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
});

describe('바텐더 노트 좋아하는 술 고르기', () => {
  it('검색 결과를 끝까지 내리면 다음 결과가 이어지고, 이어 받은 술도 고를 수 있다', async () => {
    const firstPage = Array.from({ length: 20 }, (_, index) =>
      item(index + 1, `글렌 ${index + 1}`),
    );
    const lookupPage = vi
      .spyOn(AlcoholsApi, 'lookupPage')
      .mockResolvedValueOnce(lookupResponse(firstPage, 'cursor-2'))
      .mockResolvedValueOnce(lookupResponse([item(21, '글렌 21')]));
    const onAnswer = renderLikes();

    fireEvent.change(
      screen.getByRole('searchbox', { name: '마셔본 술 이름 검색' }),
      { target: { value: '글렌' } },
    );
    expect(
      await screen.findByRole('button', { name: /글렌 20/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /글렌 21/ }),
    ).not.toBeInTheDocument();

    scrollToEnd();
    const lastItem = await screen.findByRole('button', { name: /글렌 21/ });
    expect(lookupPage).toHaveBeenLastCalledWith(
      expect.objectContaining({ keyword: '글렌', cursor: 'cursor-2' }),
    );
    // 마지막 페이지 뒤에는 더 요청하지 않는다
    scrollToEnd();
    expect(lookupPage).toHaveBeenCalledTimes(2);

    fireEvent.click(lastItem);
    fireEvent.click(screen.getByRole('button', { name: '이 술을 기억할게요' }));
    await waitFor(() => expect(onAnswer).toHaveBeenCalledWith([21]));
  });
});

import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BartenderFrame from './BartenderFrame';
import { FlowAction } from './FlowControls';

/** 키보드가 올라오면 보이는 화면(visualViewport)만 줄어드는 모바일 브라우저를 흉내 낸다. */
class FakeVisualViewport extends EventTarget {
  width = 390;

  height = 844;

  resize(height: number) {
    this.height = height;
    this.dispatchEvent(new Event('resize'));
  }
}

let viewport: FakeVisualViewport;

beforeEach(() => {
  viewport = new FakeVisualViewport();
  Object.defineProperty(window, 'visualViewport', {
    configurable: true,
    value: viewport,
  });
  window.matchMedia = vi.fn().mockReturnValue({ matches: true });
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  Element.prototype.scrollTo = vi.fn();
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
  Object.defineProperty(window, 'visualViewport', {
    configurable: true,
    value: undefined,
  });
});

function renderFrame() {
  const utils = render(
    <BartenderFrame
      step="review-text"
      title="리뷰 쓰기"
      subtitle=""
      lines={['어떠세요?\n키워드를 골라도 되고, 직접 쓰셔도 됩니다.']}
      pose="idle"
      onClose={() => {}}
    >
      <textarea aria-label="리뷰 본문" />
      <FlowAction onClick={() => {}}>다 썼어요</FlowAction>
    </BartenderFrame>,
  );
  const frame = utils.container.firstElementChild as HTMLElement;
  const dock = screen.getByRole('group', { name: '현재 단계 행동' });
  return { ...utils, frame, dock };
}

const strip = (container: HTMLElement) =>
  container.querySelector('[data-dialogue-strip]');

describe('키보드가 올라오면 리뷰 입력 공간을 확보한다', () => {
  it('입력칸에 포커스가 있고 화면이 키보드만큼 줄면 장면을 대사 띠로 접고 하단 버튼을 숨긴다', () => {
    const { container, frame, dock } = renderFrame();
    const input = screen.getByRole('textbox', { name: '리뷰 본문' });

    act(() => input.focus());
    act(() => viewport.resize(544));

    expect(strip(container)).toHaveTextContent('노트');
    expect(screen.getByRole('img', { hidden: true })).toHaveClass('invisible');
    expect(
      screen.getByRole('button', {
        name: '노트의 대사, 누르면 이어 보기',
        hidden: true,
      }),
    ).toHaveClass('invisible');
    expect(frame).toHaveStyle({ height: '544px' });
    expect(dock).toHaveClass('hidden');
    expect(input).toHaveFocus();
  });

  it('키보드를 닫으면 원래 장면과 하단 버튼으로 돌아오고 쓰던 내용은 남는다', () => {
    const { container, frame, dock } = renderFrame();
    const input = screen.getByRole('textbox', {
      name: '리뷰 본문',
    }) as HTMLTextAreaElement;
    act(() => input.focus());
    act(() => viewport.resize(544));
    fireEvent.change(input, { target: { value: '바닐라 향이 은은하다' } });

    act(() => {
      input.blur();
      viewport.resize(844);
    });

    expect(strip(container)).toBeNull();
    expect(frame.style.height).toBe('');
    expect(dock).not.toHaveClass('hidden');
    expect(input.value).toBe('바닐라 향이 은은하다');
  });

  it('입력칸에 포커스가 있어도 보이는 높이가 글 쓸 만큼 남아 있으면 장면을 그대로 둔다', () => {
    const { container, dock } = renderFrame();
    act(() => screen.getByRole('textbox', { name: '리뷰 본문' }).focus());

    act(() => viewport.resize(764));

    expect(strip(container)).toBeNull();
    expect(dock).not.toHaveClass('hidden');
  });

  it('글 입력칸에 포커스가 없으면 화면이 줄어도 장면을 그대로 둔다', () => {
    const { container } = renderFrame();

    act(() => viewport.resize(544));

    expect(strip(container)).toBeNull();
  });

  it('원래 화면이 작으면 키보드가 뜨기 전에도 포커스만으로 장면을 접는다', () => {
    viewport.height = 600;
    const { container } = renderFrame();

    act(() => screen.getByRole('textbox', { name: '리뷰 본문' }).focus());

    expect(strip(container)).toHaveTextContent('노트');
  });
});

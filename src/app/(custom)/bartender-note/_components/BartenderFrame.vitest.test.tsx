import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import BartenderFrame from './BartenderFrame';

vi.mock('./BarScene', () => ({ default: () => <div>바텐더</div> }));
vi.mock('./useDialoguePlayback', () => ({
  useDialoguePlayback: () => ({
    optionsVisible: false,
    introPhase: 'ready',
    introReady: true,
    isTyping: true,
    text: '질문을 읽는 중',
    hasNextPage: false,
    advance: vi.fn(),
    markSceneReady: vi.fn(),
  }),
}));
afterEach(cleanup);
beforeEach(() => {
  Element.prototype.scrollTo = vi.fn();
});

it('질문이 바뀌고 대사가 재생 중이어도 선택지를 유지하고 클릭을 전달한다', () => {
  const choose = vi.fn();
  const props = {
    step: 'level' as const,
    title: '바텐더 노트',
    subtitle: '질문 1',
    progress: 0,
    pose: 'idle' as const,
    onClose: vi.fn(),
    revealOptionsImmediately: true,
  };
  const { rerender } = render(
    <BartenderFrame {...props} lines={['경험을 알려주세요']}>
      <button onClick={choose}>처음이에요</button>
    </BartenderFrame>,
  );
  fireEvent.click(screen.getByRole('button', { name: '처음이에요' }));
  expect(choose).toHaveBeenCalledTimes(1);
  rerender(
    <BartenderFrame {...props} lines={['종류를 골라주세요']}>
      <button onClick={choose}>싱글몰트</button>
    </BartenderFrame>,
  );
  expect(screen.getByRole('button', { name: '싱글몰트' })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: '싱글몰트' }));
  expect(choose).toHaveBeenCalledTimes(2);
});

it('기존 흐름은 대사 재생 뒤 선택지를 표시하는 동작을 유지한다', () => {
  render(
    <BartenderFrame
      step="level"
      title="바텐더 노트"
      subtitle="질문 1"
      progress={0}
      pose="idle"
      onClose={vi.fn()}
      lines={['경험을 알려주세요']}
    >
      <button>처음이에요</button>
    </BartenderFrame>,
  );
  expect(
    screen.queryByRole('button', { name: '처음이에요' }),
  ).not.toBeInTheDocument();
});

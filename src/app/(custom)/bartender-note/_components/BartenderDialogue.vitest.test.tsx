import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BartenderDialogue from './BartenderDialogue';

vi.mock('framer-motion', () => ({ useReducedMotion: () => false }));
beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('바텐더 대화', () => {
  it('타이핑을 건너뛰고 다음 대사를 본 뒤 이동하면 이전 대사가 다시 나타나지 않는다', () => {
    const callback = vi.fn();
    const { rerender } = render(
      <BartenderDialogue
        key="first"
        pages={['첫 이야기입니다.', '두 번째 이야기입니다.']}
        ready
        onTalkingChange={callback}
      />,
    );
    act(() => vi.advanceTimersByTime(60));
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveTextContent('첫 이야기입니다.');
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveTextContent(
      '두 번째 이야기입니다.',
    );
    rerender(
      <BartenderDialogue
        key="next"
        pages={['다음 질문입니다.']}
        ready
        onTalkingChange={callback}
      />,
    );
    act(() => vi.advanceTimersByTime(10000));
    expect(screen.getByRole('button')).toHaveTextContent('다음 질문입니다.');
    expect(screen.getByRole('button')).not.toHaveTextContent(
      '두 번째 이야기입니다.',
    );
  });
});

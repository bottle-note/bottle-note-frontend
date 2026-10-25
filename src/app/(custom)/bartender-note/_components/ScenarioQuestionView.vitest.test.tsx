import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ScenarioQuestionView from './ScenarioQuestionView';

describe('시나리오 숫자 범위 입력', () => {
  it('응답의 범위·단위를 표시하고 올바른 최솟값·최댓값을 제출한다', () => {
    const onAnswer = vi.fn();
    render(
      <ScenarioQuestionView
        disabled={false}
        onAnswer={onAnswer}
        question={{
          id: 901,
          prompt: '도수를 골라 주세요',
          input: {
            kind: 'range',
            min: 40,
            max: 60,
            step: 0.5,
            unit: '%',
            allowAny: true,
          },
        }}
      />,
    );
    const min = screen.getByRole('spinbutton', { name: '최솟값' });
    const max = screen.getByRole('spinbutton', { name: '최댓값' });
    expect(min).toHaveAttribute('min', '40');
    expect(max).toHaveAttribute('max', '60');
    expect(min).toHaveAttribute('step', '0.5');
    fireEvent.change(min, { target: { value: '55' } });
    fireEvent.change(max, { target: { value: '45' } });
    expect(screen.getByRole('button', { name: '다음' })).toBeDisabled();
    expect(screen.getByRole('alert')).toHaveTextContent(
      '최솟값은 최댓값보다 클 수 없어요',
    );
    fireEvent.change(min, { target: { value: '42.5' } });
    fireEvent.click(screen.getByRole('button', { name: '다음' }));
    expect(onAnswer).toHaveBeenCalledWith({
      kind: 'range',
      min: 42.5,
      max: 45,
    });
    fireEvent.click(screen.getByRole('button', { name: '상관없어요' }));
    expect(onAnswer).toHaveBeenLastCalledWith({ kind: 'any' });
  });
});

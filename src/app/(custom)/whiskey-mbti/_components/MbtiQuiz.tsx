'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

import { MBTI_QUESTIONS } from '../_data/questions';
import styles from '../mbti.module.css';
import type { MbtiCode, MbtiResultResponse, MbtiTieQuestion } from '../_types';

interface Props {
  onComplete: (code: MbtiCode) => void;
}

async function getResult(answers: number[]) {
  const response = await fetch('/api/whiskey-mbti/result', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers }),
  });

  if (!response.ok) throw new Error('결과를 계산하지 못했어요.');
  return response.json() as Promise<MbtiResultResponse>;
}

export default function MbtiQuiz({ onComplete }: Props) {
  const [answers, setAnswers] = useState<number[]>([]);
  const [tieQuestions, setTieQuestions] = useState<MbtiTieQuestion[]>([]);
  const questionIndex = answers.length;
  const question =
    questionIndex < MBTI_QUESTIONS.length
      ? MBTI_QUESTIONS[questionIndex]
      : tieQuestions[questionIndex - MBTI_QUESTIONS.length];
  const isTasteQuestion = questionIndex >= 12;
  const total = MBTI_QUESTIONS.length + tieQuestions.length;

  const resultMutation = useMutation({
    mutationFn: getResult,
    onSuccess: (response) => {
      if (response.status === 'complete') {
        onComplete(response.code);
        return;
      }
      setTieQuestions((current) => [...current, response.question]);
    },
  });

  const choose = (optionIndex: number) => {
    if (!question || resultMutation.isPending) return;
    const nextAnswers = [...answers, optionIndex];
    setAnswers(nextAnswers);

    if (nextAnswers.length >= MBTI_QUESTIONS.length) {
      resultMutation.mutate(nextAnswers);
    }
  };

  const goBack = () => {
    if (!answers.length || resultMutation.isPending) return;
    const nextAnswers = answers.slice(0, -1);
    setAnswers(nextAnswers);
    setTieQuestions((current) => {
      if (nextAnswers.length < MBTI_QUESTIONS.length) return [];
      return current.slice(0, nextAnswers.length - MBTI_QUESTIONS.length + 1);
    });
    resultMutation.reset();
  };

  if (!question) {
    return (
      <section className={`${styles.screen} ${styles.gate}`} aria-live="polite">
        <p>
          {resultMutation.isError
            ? '결과를 계산하지 못했어요.'
            : '결과를 계산하는 중이에요.'}
        </p>
        {resultMutation.isError && (
          <>
            <button
              className={styles.resultButton}
              onClick={() => resultMutation.mutate(answers)}
            >
              다시 시도하기
            </button>
            <button className={styles.back} onClick={goBack}>
              ← 이전 질문
            </button>
          </>
        )}
      </section>
    );
  }

  return (
    <section className={styles.screen} aria-live="polite">
      <div className={styles.quizHead}>
        <div>
          <p className={styles.eyebrow}>
            {questionIndex >= MBTI_QUESTIONS.length
              ? '비슷한 두 취향 중 더 끌리는 쪽을 골라주세요'
              : isTasteQuestion
                ? '이제 당신이 좋아하는 맛을 찾아볼게요'
                : '술자리 성향으로 알아보는 나의 위스키 타입'}
          </p>
          <h1 className={styles.question}>{question.text}</h1>
        </div>
        <p className={styles.counter}>
          <span>{String(questionIndex + 1).padStart(2, '0')}</span> /{' '}
          {String(total).padStart(2, '0')}
        </p>
      </div>
      <div className={styles.progress} aria-hidden="true">
        <i style={{ width: `${((questionIndex + 1) / total) * 100}%` }} />
      </div>
      <div
        className={`${styles.answers} ${isTasteQuestion ? styles.tasteAnswers : ''}`}
      >
        {question.options.map((option, index) => (
          <button
            className={styles.answer}
            key={option}
            onClick={() => choose(index)}
            disabled={resultMutation.isPending}
          >
            <b>{String.fromCharCode(65 + index)}</b>
            <span>{option}</span>
          </button>
        ))}
      </div>
      {resultMutation.isError && (
        <p className={styles.error}>
          결과를 계산하지 못했어요. 다시 선택해 주세요.
        </p>
      )}
      <p className={styles.hint}>
        술자리에서의 행동과 평소 맛 취향을 떠올리며, 더 가까운 답을 골라주세요.
      </p>
      <button className={styles.back} onClick={goBack} hidden={!answers.length}>
        ← 이전 질문
      </button>
    </section>
  );
}

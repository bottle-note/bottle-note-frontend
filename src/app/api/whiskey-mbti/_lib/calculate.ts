import type {
  MbtiCode,
  MbtiResultResponse,
  MbtiTaste,
  MbtiType,
} from '@/app/(custom)/whiskey-mbti/_types';

const PERSONALITY_ANSWERS = [
  ['E', 'I'],
  ['I', 'E'],
  ['E', 'I'],
  ['S', 'N'],
  ['N', 'S'],
  ['S', 'N'],
  ['F', 'T'],
  ['T', 'F'],
  ['T', 'F'],
  ['J', 'P'],
  ['P', 'J'],
  ['J', 'P'],
] as const;

const TASTE_ANSWERS = [
  ['A', 'B'],
  ['B', 'C'],
  ['C', 'A'],
  ['B', 'A'],
  ['C', 'B'],
  ['A', 'C'],
] as const;

const TASTE_LABELS: Record<MbtiTaste, string> = {
  A: '산뜻하고 향긋한 과실 풍미의 한 잔',
  B: '건과일과 디저트처럼 진하고 달콤한 한 잔',
  C: '스모키하고 개성 있는 풍미의 한 잔',
};

function getPersonality(answers: number[]): MbtiType {
  const scores: Record<string, number> = {
    E: 0,
    I: 0,
    S: 0,
    N: 0,
    T: 0,
    F: 0,
    J: 0,
    P: 0,
  };
  PERSONALITY_ANSWERS.forEach((options, index) => {
    scores[options[answers[index]]]++;
  });
  return `${scores.E > scores.I ? 'E' : 'I'}${scores.S > scores.N ? 'S' : 'N'}${scores.T > scores.F ? 'T' : 'F'}${scores.J > scores.P ? 'J' : 'P'}` as MbtiType;
}

function getTiedTastes(answers: number[]): MbtiTaste[] {
  const score: Record<MbtiTaste, number> = { A: 0, B: 0, C: 0 };
  TASTE_ANSWERS.forEach((options, index) => {
    score[options[answers[index + 12]]]++;
  });
  const highest = Math.max(...Object.values(score));
  let candidates = (Object.keys(score) as MbtiTaste[]).filter(
    (taste) => score[taste] === highest,
  );

  // 원본 HTML과 같은 2-way 토너먼트: A/B 승자와 C를 다시 비교한다.
  for (let index = 18; index < answers.length; index++) {
    const offered = candidates.slice(0, 2);
    const winner = offered[answers[index]];
    if (!winner) return candidates;
    candidates = candidates.filter(
      (candidate) => candidate === winner || !offered.includes(candidate),
    );
  }

  return candidates;
}

export function calculateMbtiResult(
  answers: unknown,
): MbtiResultResponse | null {
  if (
    !Array.isArray(answers) ||
    answers.length < 18 ||
    answers.length > 20 ||
    answers.some((answer) => answer !== 0 && answer !== 1)
  ) {
    return null;
  }

  const selections = answers as number[];
  const initialCandidates = getTiedTastes(selections.slice(0, 18));
  const submittedTieAnswers = selections.length - 18;
  const expectedTieAnswers = initialCandidates.length - 1;
  if (submittedTieAnswers > expectedTieAnswers) return null;

  const candidates = getTiedTastes(selections);
  if (candidates.length !== 1) {
    if (submittedTieAnswers !== expectedTieAnswers - (candidates.length - 1))
      return null;
    return {
      status: 'tie',
      question: {
        text: '마지막으로, 지금 더 마시고 싶은 한 잔은?',
        options: candidates.slice(0, 2).map((taste) => TASTE_LABELS[taste]),
      },
    };
  }

  if (submittedTieAnswers !== expectedTieAnswers) return null;
  return {
    status: 'complete',
    code: `${getPersonality(selections)}-${candidates[0]}` as MbtiCode,
  };
}

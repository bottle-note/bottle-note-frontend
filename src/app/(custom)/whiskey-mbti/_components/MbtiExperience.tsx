'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { ROUTES } from '@/constants/routes';
import { trackCampaignEvent } from '@/api/campaign-content/campaign-content.api';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import { setReturnToUrl, WHISKEY_MBTI_INTRO_PATH } from '@/utils/loginRedirect';

import styles from '../mbti.module.css';
import type { MbtiCode, MbtiTieQuestion } from '../_types';

const PROGRESS_KEY = 'whiskey-mbti-progress';

function readProgress(): MbtiCode | null {
  try {
    const saved = JSON.parse(sessionStorage.getItem(PROGRESS_KEY) || 'null');
    if (
      saved?.version === 1 &&
      typeof saved.code === 'string' &&
      /^[EI][NS][FT][JP]-[ABC]$/.test(saved.code) &&
      Array.isArray(saved.answers) &&
      saved.answers.length >= 18 &&
      saved.answers.length <= 20 &&
      saved.answers.every((answer: unknown) => answer === 0 || answer === 1) &&
      Array.isArray(saved.tieQuestions)
    ) {
      return saved.code as MbtiCode;
    }
  } catch {
    // An old or unavailable session snapshot must not prevent a new test.
  }
  return null;
}

const MbtiQuiz = dynamic(() => import('./MbtiQuiz'), {
  ssr: false,
  loading: () => <p className={styles.loading}>질문을 준비하는 중이에요.</p>,
});
const MbtiResult = dynamic(() => import('./MbtiResult'), {
  ssr: false,
  loading: () => <p className={styles.loading}>결과를 준비하는 중이에요.</p>,
});
const LoginModal = dynamic(
  () => import('@/components/domain/auth/LoginModal'),
  {
    ssr: false,
  },
);

type Phase = 'intro' | 'quiz' | 'complete' | 'result';

export default function MbtiExperience() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn, isLoading } = useAuthSession();
  const resultCode = searchParams.get('result') as MbtiCode | null;
  const isShared = searchParams.get('shared') === '1';
  const [phase, setPhase] = useState<Phase>(resultCode ? 'result' : 'intro');
  const [completedCode, setCompletedCode] = useState<MbtiCode | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const previousResultCode = useRef(resultCode);
  const hasViewed = useRef(false);
  const shownResultCode = useRef<MbtiCode | null>(null);

  useEffect(() => {
    if (!hasViewed.current) {
      hasViewed.current = true;
      trackCampaignEvent('whiskey-mbti', 'VIEW');
    }
    const savedCode = readProgress();
    if (savedCode) {
      setCompletedCode(savedCode);
      if (!resultCode)
        setPhase((current) => (current === 'intro' ? 'complete' : current));
    }
  }, []); // Restore only on entry, not on every result/quiz transition.

  useEffect(() => {
    if (resultCode && resultCode !== previousResultCode.current) {
      setPhase('result');
    } else if (
      previousResultCode.current &&
      !resultCode &&
      phase === 'result'
    ) {
      setPhase('intro');
    }
    previousResultCode.current = resultCode;
  }, [phase, resultCode]);

  const handleComplete = (
    code: MbtiCode,
    answers: number[],
    tieQuestions: MbtiTieQuestion[],
  ) => {
    try {
      sessionStorage.setItem(
        PROGRESS_KEY,
        JSON.stringify({ version: 1, code, answers, tieQuestions }),
      );
    } catch {
      // In-memory completion still works when browser storage is unavailable.
    }
    trackCampaignEvent('whiskey-mbti', 'FINISH');
    setCompletedCode(code);
    setPhase('complete');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const code = resultCode ?? completedCode;

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={`${styles.wrap} ${styles.nav}`}>
          <div className={styles.brand}>
            <Link href={ROUTES.HOME} aria-label="보틀노트 홈으로 이동">
              <img
                src="/images/whiskey-mbti/bottle-note-logo.svg"
                alt="보틀노트"
              />
            </Link>
            <span>× WHISKY MBTI</span>
          </div>
        </div>
      </header>

      <div className={`${styles.wrap} ${styles.main}`}>
        {phase === 'intro' && (
          <section
            className={`${styles.screen} ${styles.gate}`}
            aria-live="polite"
          >
            <p className={styles.eyebrow}>16가지 성격, 48가지 위스키</p>
            <h1>WHISKY MBTI: 나를 닮은 한 잔</h1>
            <p>
              바에서의 행동과 평소 맛 취향을 통해 나와 어울리는 위스키 한 잔을
              찾아보세요.
            </p>
            <div className={styles.introMeta}>18~20문항 · 약 3분</div>
            <button
              className={styles.resultButton}
              onClick={() => {
                sessionStorage.removeItem(PROGRESS_KEY);
                trackCampaignEvent('whiskey-mbti', 'START');
                setPhase('quiz');
              }}
            >
              테스트 시작하기
            </button>
            <small className={styles.introNote}>
              실제 MBTI 검사와 다를 수 있는 술 취향 기반 콘텐츠입니다.
            </small>
          </section>
        )}

        {phase === 'quiz' && <MbtiQuiz onComplete={handleComplete} />}

        {phase === 'complete' && (
          <section
            className={`${styles.screen} ${styles.gate}`}
            aria-live="polite"
          >
            <div className={styles.gateMark}>✓</div>
            <p className={styles.eyebrow}>Test complete.</p>
            <h1>당신의 위스키 MBTI를 찾았어요.</h1>
            <p>
              술자리 성향과 맛 취향으로 완성된 타입과 오늘 바에서 마실 한 잔을
              확인해보세요.
            </p>
            <button
              className={styles.resultButton}
              onClick={() =>
                isLoggedIn ? setPhase('result') : setShowLogin(true)
              }
              disabled={isLoading}
            >
              {isLoading ? '확인 중...' : '결과 보기'}
            </button>
          </section>
        )}

        {phase === 'result' && code && isLoading && (
          <p className={styles.loading}>로그인 상태를 확인하는 중이에요.</p>
        )}
        {phase === 'result' && code && !isLoading && !isLoggedIn && (
          <section
            className={`${styles.screen} ${styles.gate}`}
            aria-live="polite"
          >
            <p className={styles.eyebrow}>Test complete.</p>
            <h1>로그인 후 결과를 볼 수 있어요.</h1>
            <button
              className={styles.resultButton}
              onClick={() => setShowLogin(true)}
            >
              결과 보기
            </button>
          </section>
        )}
        {phase === 'result' && code && !isLoading && isLoggedIn && (
          <MbtiResult
            code={code}
            isShared={isShared}
            isLoggedIn={isLoggedIn}
            isAuthLoading={isLoading}
            onShown={(shownCode) => {
              if (shownResultCode.current !== shownCode) {
                shownResultCode.current = shownCode;
                trackCampaignEvent('whiskey-mbti', 'RESULT');
              }
            }}
            onStartTest={() => {
              if (isLoggedIn) {
                sessionStorage.removeItem(PROGRESS_KEY);
                trackCampaignEvent('whiskey-mbti', 'START');
                setPhase('quiz');
                router.replace('/whiskey-mbti');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                setReturnToUrl(WHISKEY_MBTI_INTRO_PATH);
                router.push(ROUTES.LOGIN);
              }
            }}
            onRestart={() => {
              sessionStorage.removeItem(PROGRESS_KEY);
              trackCampaignEvent('whiskey-mbti', 'START');
              setCompletedCode(null);
              setPhase('quiz');
              router.replace('/whiskey-mbti');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </div>

      <footer className={styles.footer}>
        <div className={`${styles.wrap} ${styles.foot}`}>
          <span>FIND YOUR NEXT DRAM.</span>
          <span>지나친 음주는 건강에 해롭습니다.</span>
        </div>
      </footer>

      {showLogin && (
        <LoginModal
          handleClose={() => {
            setShowLogin(false);
          }}
          returnTo={
            resultCode
              ? `/whiskey-mbti?${searchParams.toString()}`
              : completedCode
                ? `/whiskey-mbti?result=${completedCode}`
                : '/whiskey-mbti'
          }
        />
      )}
    </div>
  );
}

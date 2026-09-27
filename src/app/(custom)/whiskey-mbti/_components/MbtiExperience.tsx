'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { ROUTES } from '@/constants/routes';
import { useAuthSession } from '@/hooks/auth/useAuthSession';

import styles from '../mbti.module.css';
import type { MbtiCode } from '../_types';

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
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (resultCode && phase === 'intro') {
      setPhase('result');
    } else if (!resultCode && phase === 'result') {
      setPhase('intro');
    }
  }, [phase, resultCode]);

  // 결과 코드는 로그인 여부와 관계없이 URL에 보존하고, 완료 화면은 그대로 유지한다.
  const handleComplete = (code: MbtiCode) => {
    setPhase('complete');
    router.replace(
      `${ROUTES.WHISKEY_MBTI}?${new URLSearchParams({ result: code })}`,
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 쿼리로 복원한 결과도 본인 결과는 로그인 후 표시하고, 공유 결과는 바로 표시한다.
  const canShowResult = isShared || isLoggedIn;

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
              onClick={() => setPhase('quiz')}
            >
              테스트 시작하기
            </button>
            <small className={styles.introNote}>
              실제 MBTI 검사와 다를 수 있는 술 취향 기반 콘텐츠입니다.
            </small>
          </section>
        )}

        {phase === 'quiz' && <MbtiQuiz onComplete={handleComplete} />}

        {(phase === 'complete' || (phase === 'result' && !canShowResult)) && (
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
              disabled={isLoading || !resultCode}
            >
              {isLoading ? '확인 중...' : '결과 보기'}
            </button>
          </section>
        )}

        {phase === 'result' && resultCode && canShowResult && (
          <MbtiResult
            code={resultCode}
            isShared={isShared}
            isLoggedIn={isLoggedIn}
            isAuthLoading={isLoading}
            onStartTest={() => {
              if (isLoggedIn) {
                setPhase('quiz');
                router.replace('/whiskey-mbti');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                // 로그인 취소의 공통 뒤로가기로 MBTI 시작 화면에 돌아오도록 정리한다.
                setPhase('intro');
                window.history.replaceState(
                  window.history.state,
                  '',
                  ROUTES.WHISKEY_MBTI,
                );
                const params = new URLSearchParams({
                  returnTo: ROUTES.WHISKEY_MBTI,
                });
                router.push(`${ROUTES.LOGIN}?${params.toString()}`);
              }
            }}
            onRestart={() => {
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
          handleClose={() => setShowLogin(false)}
          returnTo={
            resultCode
              ? `${ROUTES.WHISKEY_MBTI}?${new URLSearchParams({ result: resultCode })}`
              : ROUTES.WHISKEY_MBTI
          }
        />
      )}
    </div>
  );
}

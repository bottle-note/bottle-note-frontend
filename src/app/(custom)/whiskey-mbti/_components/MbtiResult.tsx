'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';

import { ROUTES } from '@/constants/routes';

import styles from '../mbti.module.css';
import type { MbtiCode, MbtiResultDetail } from '../_types';

const ShareDropdown = dynamic(
  () => import('@/components/share/ShareDropdown'),
  { ssr: false },
);

interface Props {
  code: MbtiCode;
  isShared: boolean;
  isLoggedIn: boolean;
  isAuthLoading: boolean;
  onStartTest: () => void;
  onRestart: () => void;
}

async function fetchResult(code: MbtiCode) {
  const response = await fetch(
    `/api/whiskey-mbti/result?code=${encodeURIComponent(code)}`,
  );
  if (!response.ok) throw new Error('결과를 불러오지 못했어요.');
  return response.json() as Promise<MbtiResultDetail>;
}

export default function MbtiResult({
  code,
  isShared,
  isLoggedIn,
  isAuthLoading,
  onStartTest,
  onRestart,
}: Props) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['whiskey-mbti-result', code],
    queryFn: () => fetchResult(code),
  });
  const [isShareOpen, setIsShareOpen] = useState(false);

  if (isLoading)
    return <p className={styles.loading}>결과를 불러오는 중이에요.</p>;
  if (isError || !data) {
    return (
      <section className={`${styles.screen} ${styles.gate}`}>
        <h1>결과를 불러오지 못했어요.</h1>
        <button className={styles.resultButton} onClick={() => refetch()}>
          다시 시도하기
        </button>
      </section>
    );
  }

  const origin = typeof window === 'undefined' ? '' : window.location.origin;
  const isInApp = typeof window !== 'undefined' && window.isInApp;
  const shareUrl = `${origin}/whiskey-mbti?result=${data.code}&shared=1`;
  const shareImageUrl = `${origin}${data.characterImage}`;

  return (
    <section
      className={`${styles.screen} ${styles.result}`}
      style={{ '--tone': data.tone } as React.CSSProperties}
      aria-live="polite"
    >
      <p className={styles.eyebrow}>
        술자리 성향과 맛 취향으로 완성된 위스키 MBTI
      </p>
      <div className={styles.resultTop}>
        <div className={styles.resultType}>{data.type}</div>
      </div>
      <p className={styles.tasteLabel}>
        {data.tasteLabel} · {data.code}
      </p>
      <div className={styles.resultGrid}>
        <div className={styles.resultCopy}>
          <div className={styles.portrait}>
            <img
              src={data.characterImage}
              alt={`${data.type} · ${data.whisky.name} 캐릭터 이미지`}
            />
          </div>
          <h1>{data.title}</h1>
          <p>{data.reason}</p>
        </div>
        <aside className={styles.dram}>
          {data.whisky.imageUrl && (
            <div className={styles.dramMedia}>
              <img
                src={data.whisky.imageUrl}
                alt={`${data.whisky.name} 제품 이미지`}
              />
            </div>
          )}
          <small>다음 바에서 마실 한 잔</small>
          <h2>{data.whisky.name}</h2>
          <div className={styles.rating}>
            {!data.whisky.detailAvailable ? (
              <>
                <span>보틀노트 정보를 불러오지 못했어요.</span>
                <button
                  className={styles.retryDetail}
                  onClick={() => refetch()}
                >
                  다시 시도
                </button>
              </>
            ) : data.whisky.rating !== null &&
              data.whisky.ratingCount &&
              data.whisky.ratingCount > 0 ? (
              <>
                ★ {data.whisky.rating.toFixed(1)} <span>보틀노트 점수</span>
              </>
            ) : (
              <>
                ☆ <span>보틀노트 점수 · 아직 평가 없음</span>
              </>
            )}
          </div>
          <p>{data.dramCopy}</p>
          {data.whisky.id !== null && (
            <a className={styles.cta} href={ROUTES.SEARCH.ALL(data.whisky.id)}>
              <span>{data.whisky.name} 상세보기</span>
              <b>↗</b>
            </a>
          )}
        </aside>
        {!!data.whisky.tags.length && (
          <div className={styles.flavorBlock}>
            <b>테이스팅 태그</b>
            <div className={styles.notes}>
              {data.whisky.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className={styles.actions}>
        <small>실제 MBTI 검사와 다를 수 있는 술 취향 기반 콘텐츠입니다.</small>
        <div className={styles.resultActions}>
          {!isInApp && (
            <a
              className={styles.download}
              href="https://linktr.ee/bottlenote_official"
              target="_blank"
              rel="noreferrer"
            >
              보틀노트 다운받으러 가기 ↗
            </a>
          )}
          {!isShared && (
            <button
              className={styles.share}
              onClick={() => setIsShareOpen(true)}
            >
              친구에게 결과 공유하기
            </button>
          )}
          <button
            className={styles.restart}
            onClick={isShared ? onStartTest : onRestart}
            disabled={isShared && isAuthLoading}
          >
            {isShared
              ? isAuthLoading
                ? '확인 중...'
                : isLoggedIn
                  ? '나도 테스트하기'
                  : '로그인 후 나도 테스트하기'
              : '다시 테스트하기'}
          </button>
        </div>
      </div>
      {!isShared && isShareOpen && (
        <ShareDropdown
          isOpen
          onClose={() => setIsShareOpen(false)}
          config={{
            type: 'event',
            contentId: `whiskey-mbti-${data.code}`,
            title: 'WHISKY MBTI: 나를 닮은 한 잔',
            description: data.title,
            imageUrl: shareImageUrl,
            linkUrl: shareUrl,
            buttonTitle: '결과 보러 가기',
          }}
        />
      )}
    </section>
  );
}

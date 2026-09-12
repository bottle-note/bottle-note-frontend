import { Suspense } from 'react';
import MbtiExperience from './_components/MbtiExperience';
import styles from './mbti.module.css';

export default function WhiskeyMbtiPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.shell}>
          <p className={styles.loading}>위스키 MBTI를 준비하는 중이에요.</p>
        </div>
      }
    >
      <MbtiExperience />
    </Suspense>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import styles from '../bartender.module.css';

export type BartenderPose =
  | 'welcome'
  | 'idle'
  | 'think'
  | 'serve'
  | 'smile'
  | 'toast'
  | 'sorry';

const FRAMES = {
  idle: 0,
  talk: 1,
  blink: 2,
  think: 3,
  pour: 4,
  serve: 5,
  smile: 6,
  toast: 8,
  sorry: 9,
  greet: 10,
};
const ASSETS = ['bar-0.webp', 'bar-1.webp', 'bar-2.webp', 'bartender.webp'];
const WIDTH = 750;
const HEIGHT = 480;

interface Props {
  pose: BartenderPose;
  talking: boolean;
  sceneKey: string;
  onReady: () => void;
}

/** Artwork coordinates stay in the original 750 × 480 space at every viewport. */
export default function BartenderScene({
  pose,
  talking,
  sceneKey,
  onReady,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const assetsRef = useRef<HTMLImageElement[]>([]);
  const sequenceRef = useRef({ key: '', start: 0 });
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const reduceMotion = useReducedMotion();
  const readyRef = useRef(onReady);
  readyRef.current = onReady;

  useEffect(() => {
    let disposed = false;
    const images = ASSETS.map(() => new Image());
    const loading = images.map(
      (image, index) =>
        new Promise<void>((resolve, reject) => {
          Object.assign(image, {
            onload: () => resolve(),
            onerror: reject,
            src: `/images/bartender-note/${ASSETS[index]}`,
          });
        }),
    );
    const fallback = window.setTimeout(() => {
      if (!disposed) {
        setFailed(true);
        readyRef.current();
      }
    }, 5000);
    Promise.all(loading)
      .then(() => {
        if (disposed) return;
        assetsRef.current = images;
        setLoaded(true);
        setFailed(false);
        readyRef.current();
      })
      .catch(() => {
        if (!disposed) {
          setFailed(true);
          readyRef.current();
        }
      })
      .finally(() => window.clearTimeout(fallback));
    return () => {
      disposed = true;
      window.clearTimeout(fallback);
      images.forEach((image) => {
        Object.assign(image, { onload: null, onerror: null });
      });
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!loaded || !canvas || !context) return;
    const [base, light, dusk, sprite] = assetsRef.current;
    let frameId = 0;
    const sequenceKey = `${sceneKey}:${pose}`;
    if (sequenceRef.current.key !== sequenceKey)
      sequenceRef.current = { key: sequenceKey, start: performance.now() };
    const start = sequenceRef.current.start;
    let visible = true;
    let previous = '';
    const draw = (now: number) => {
      const elapsed = now - start;
      let frame: number = FRAMES.idle;
      if (pose === 'welcome' && elapsed < 1900)
        frame = elapsed < 1100 ? FRAMES.sorry : FRAMES.greet;
      else if (pose === 'serve' && elapsed < 1700) frame = FRAMES.pour;
      else if (talking && !reduceMotion)
        frame = Math.floor(elapsed / 170) % 2 ? FRAMES.talk : FRAMES.idle;
      else if (pose === 'welcome') frame = FRAMES.greet;
      else frame = FRAMES[pose];
      if (reduceMotion)
        frame = pose === 'welcome' ? FRAMES.greet : FRAMES[pose];
      if (pose === 'idle' && !talking && !reduceMotion && elapsed % 4700 > 4500)
        frame = FRAMES.blink;
      const cycle = elapsed % 6600;
      const glow =
        reduceMotion || cycle < 3500
          ? 0
          : Math.sin(((cycle - 3500) / 3100) * Math.PI) * 0.6;
      const key = `${frame}:${Math.round(glow * 60)}`;
      if (key !== previous) {
        previous = key;
        const overlay = Math.floor(elapsed / 6600) % 2 ? dusk : light;
        const background = (y: number, height: number) => {
          context.drawImage(base, 0, y, WIDTH, height, 0, y, WIDTH, height);
          context.globalAlpha = glow;
          context.drawImage(overlay, 0, y, WIDTH, height, 0, y, WIDTH, height);
          context.globalAlpha = 1;
        };
        context.clearRect(0, 0, WIDTH, HEIGHT);
        background(0, HEIGHT);
        context.drawImage(sprite, frame * 249, 0, 249, 264, 263, 109, 224, 238);
        background(342, HEIGHT - 342);
      }
      if (!reduceMotion && visible && !document.hidden)
        frameId = requestAnimationFrame(draw);
    };
    const resume = () => {
      cancelAnimationFrame(frameId);
      if (visible && !document.hidden) {
        previous = '';
        draw(performance.now());
      }
    };
    const observer =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            resume();
          });
    observer?.observe(canvas);
    document.addEventListener('visibilitychange', resume);
    resume();
    return () => {
      cancelAnimationFrame(frameId);
      observer?.disconnect();
      document.removeEventListener('visibilitychange', resume);
    };
  }, [loaded, pose, talking, sceneKey, reduceMotion]);

  return (
    <div className={styles.artwork}>
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        role="img"
        aria-label="따뜻한 바의 카운터 너머에서 기다리는 바텐더 노트"
      />
      {!loaded && (
        <p className={styles.artworkFallback}>
          {failed ? '편하게 이야기 나눠요.' : '바의 불을 켜고 있어요…'}
        </p>
      )}
    </div>
  );
}

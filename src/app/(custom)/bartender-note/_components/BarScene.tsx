'use client';

import { useEffect, useRef } from 'react';

export type Pose =
  | 'idle'
  | 'bow'
  | 'think'
  | 'pour'
  | 'serve'
  | 'smile'
  | 'nose'
  | 'toast'
  | 'greet';

const POSE_FRAME: Record<Pose, number> = {
  idle: 0,
  bow: 9,
  think: 3,
  pour: 4,
  serve: 5,
  smile: 6,
  nose: 7,
  toast: 8,
  greet: 10,
};

const SCENE_SIZE = { width: 750, height: 480 };
const CHARACTER = {
  width: 249,
  height: 264,
  targetWidth: 224,
  targetHeight: 238,
  x: 263,
  y: 109,
};
const BG_HOLD = 3500;
const BG_OUT = 1150;
const BG_STAY = 450;
const BG_BACK = 1500;
const BG_CYCLE = BG_HOLD + BG_OUT + BG_STAY + BG_BACK;
const ease = (value: number) => 0.5 - 0.5 * Math.cos(Math.PI * value);

function sceneLighting(time: number) {
  const cycle = time % BG_CYCLE;
  const amplitude = Math.floor(time / BG_CYCLE) % 2 ? 1.2 : 0.6;
  if (cycle < BG_HOLD) return 0;
  if (cycle < BG_HOLD + BG_OUT)
    return amplitude * ease((cycle - BG_HOLD) / BG_OUT);
  if (cycle < BG_HOLD + BG_OUT + BG_STAY) return amplitude;
  return amplitude * (1 - ease((cycle - BG_HOLD - BG_OUT - BG_STAY) / BG_BACK));
}

function drawScene(
  context: CanvasRenderingContext2D,
  images: HTMLImageElement[],
  lighting: number,
  y: number,
  height: number,
) {
  const painter = context;
  context.drawImage(
    images[0],
    0,
    y,
    SCENE_SIZE.width,
    height,
    0,
    y,
    SCENE_SIZE.width,
    height,
  );
  if (lighting > 0) {
    painter.globalAlpha = Math.min(1, lighting);
    context.drawImage(
      images[1],
      0,
      y,
      SCENE_SIZE.width,
      height,
      0,
      y,
      SCENE_SIZE.width,
      height,
    );
    if (lighting > 1) {
      painter.globalAlpha = lighting - 1;
      context.drawImage(
        images[2],
        0,
        y,
        SCENE_SIZE.width,
        height,
        0,
        y,
        SCENE_SIZE.width,
        height,
      );
    }
    painter.globalAlpha = 1;
  }
}

export default function BarScene({
  pose,
  talking,
  onReady,
}: {
  pose: Pose;
  talking: boolean;
  onReady?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseRef = useRef(pose);
  const talkingRef = useRef(talking);
  const onReadyRef = useRef(onReady);
  poseRef.current = pose;
  talkingRef.current = talking;
  onReadyRef.current = onReady;

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return undefined;

    const sources = [
      'scene-0.webp',
      'scene-1.webp',
      'scene-2.webp',
      'bartender-sprite.webp',
    ];
    const images = sources.map((file) => {
      const item = new Image();
      item.src = `/images/bartender-note/${file}`;
      return item;
    });
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reduceMotion = media.matches;
    const updateMotion = () => {
      reduceMotion = media.matches;
    };
    media.addEventListener('change', updateMotion);
    let animationFrame = 0;
    let active = true;
    let previousKey = '';
    let readyNotified = false;

    const paint = (time: number) => {
      if (!active) return;
      if (images.every((image) => image.complete && image.naturalWidth)) {
        const lighting = reduceMotion ? 0 : sceneLighting(time);
        const frame = reduceMotion
          ? POSE_FRAME[poseRef.current]
          : talkingRef.current &&
              (poseRef.current === 'idle' || poseRef.current === 'greet')
            ? Math.floor(time / 170) % 2
              ? 1
              : 0
            : poseRef.current === 'idle' &&
                Math.floor(time / 3400) % 5 === 0 &&
                time % 3400 < 180
              ? 2
              : POSE_FRAME[poseRef.current];
        const key = `${Math.round(lighting * 300)}:${frame}`;
        if (key !== previousKey) {
          previousKey = key;
          context.clearRect(0, 0, SCENE_SIZE.width, SCENE_SIZE.height);
          drawScene(context, images, lighting, 0, SCENE_SIZE.height);
          context.drawImage(
            images[3],
            frame * CHARACTER.width,
            0,
            CHARACTER.width,
            CHARACTER.height,
            CHARACTER.x,
            CHARACTER.y,
            CHARACTER.targetWidth,
            CHARACTER.targetHeight,
          );
          drawScene(context, images, lighting, 342, 138);
        }
        if (!readyNotified) {
          readyNotified = true;
          onReadyRef.current?.();
        }
      }
      animationFrame = requestAnimationFrame(paint);
    };
    animationFrame = requestAnimationFrame(paint);
    return () => {
      active = false;
      cancelAnimationFrame(animationFrame);
      media.removeEventListener('change', updateMotion);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="mb-[-6%] block aspect-[750/480] h-auto w-full -translate-y-[6%]"
      width={SCENE_SIZE.width}
      height={SCENE_SIZE.height}
      role="img"
      aria-label="어두운 바 안에서 바텐더 노트가 카운터 너머에 서 있는 장면"
    />
  );
}

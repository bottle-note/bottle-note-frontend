import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import AlcoholImage from '@/components/domain/alcohol/AlcoholImage';
import Button, { buttonVariants } from '@/components/ui/Button/Button';
import BottomSheet from '@/components/ui/Modal/BottomSheet';
import { useDialogueSettled } from './BartenderFrame';
import { STORY_NONE, storyLater, storyOffer } from './dialogue';
import { FlowDock, FlowTextAction } from './FlowControls';
import { prefersReducedMotion } from './prefersReducedMotion';
import type { ReviewAlcohol } from './reviewAlcohol';
import type { AlcoholStory, StoryMessage } from './useAlcoholStory';
import { WhiskeyImage } from './WhiskeyRow';

/** 가로 카드 한 줄에 들어가는 만큼만 보인다. */
const TAG_LIMIT = 3;

const appear =
  'motion-safe:duration-300 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2';

/**
 * 고른 술을 바텐더가 건네는 대화로 보여 준다. 추천 1위와 목록·찜·큐레이션에서 고른 술이 같은 화면을 쓴다.
 * 카드 아래에서 이야기를 들을지 묻고, 설명 첫 문단을 문장씩 말풍선으로 이어 들려준다.
 * 대답 버튼은 바텐더 말이 끝난 뒤 가장 최근 바텐더 말풍선 아랫단에 달린다.
 * 들어온 목록으로 돌아가는 것도 대답 중 하나로 내놓는다.
 */
export default function AlcoholTalk({
  alcohol,
  copy,
  story,
  onShowOthers,
  isPicked,
  isTogglingPick,
  onTogglePick,
  onWriteReview,
  onLeave,
  home,
}: {
  alcohol: ReviewAlcohol;
  /** 들어온 곳마다 달라지는 말. */
  copy: { opening: string; label: string; more?: string };
  /** 설명이 있는 술만 이야기를 들려준다. */
  story: AlcoholStory | null;
  /** 돌아갈 목록이 없으면 비워 둔다. */
  onShowOthers?: () => void;
  isPicked: boolean;
  isTogglingPick: boolean;
  onTogglePick: () => void;
  onWriteReview: () => void;
  /** 실제 술 상세 페이지로 나가기 직전에 부른다. */
  onLeave: () => void;
  home: () => void;
}) {
  const others =
    copy.more && onShowOthers
      ? { label: copy.more, onClick: onShowOthers }
      : undefined;
  const settled = useDialogueSettled();
  const [fullTextOpen, setFullTextOpen] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  // 묻는 말풍선은 대사창 인사가 끝난 뒤에 붙고, 대답은 바텐더 말이 다 끝난 뒤에 올라온다
  const offerVisible = Boolean(
    story?.asked && (settled || story.messages.length),
  );
  // 이야기하는 동안은 끝까지 이어지고, 멈추는 대답만 입력 중 표시에 단다
  const telling = story?.phase === 'telling';
  const replies =
    story && !telling && settled && !story.pending ? (
      <StoryReplies
        story={story}
        onOpenFullText={() => {
          story.openFullText();
          setFullTextOpen(true);
        }}
        others={others}
      />
    ) : null;
  // 대답은 그 대답을 부른 말풍선에 단다. 내가 마지막으로 말했으면 바텐더가 다시 권한다
  const lastFromBartender = story?.messages.at(-1)?.from === 'bartender';
  const offerReplies = story?.phase === 'offer' ? replies : null;
  const lastReplies = lastFromBartender ? replies : null;
  const laterReplies =
    story?.phase !== 'offer' && !lastFromBartender ? replies : null;

  // 새 말풍선이 오면 따라 내려간다. 단계가 바뀔 때 화면을 맨 위로 올리는 동작 뒤에 내려간다.
  const messageCount = story?.messages.length ?? 0;
  // 대답 버튼은 대사가 끝난 뒤에 달려 말풍선보다 늦게 나타난다
  const repliesShown = Boolean(replies);
  useEffect(() => {
    if (!messageCount && !story?.pending && !repliesShown) return undefined;
    const frame = requestAnimationFrame(() =>
      endRef.current?.scrollIntoView?.({
        block: 'end',
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      }),
    );
    return () => cancelAnimationFrame(frame);
  }, [messageCount, story?.pending, repliesShown]);

  return (
    <>
      <div
        role="log"
        aria-label="노트와 나눈 대화"
        className="flex flex-col gap-8"
      >
        <BartenderBubble>{copy.opening}</BartenderBubble>
        <AlcoholCard
          alcohol={alcohol}
          label={copy.label}
          isPicked={isPicked}
          isTogglingPick={isTogglingPick}
          onTogglePick={onTogglePick}
        />
        {story && offerVisible && (
          <BartenderBubble className={appear} actions={offerReplies}>
            {storyOffer(alcohol.id)}
          </BartenderBubble>
        )}
        {story?.messages.map((message, index, messages) => (
          <Message
            // 주고받은 말은 뒤에 붙기만 해 순서가 곧 정체다
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            message={message}
            actions={index === messages.length - 1 ? lastReplies : null}
          />
        ))}
        {story && laterReplies && (
          <BartenderBubble className={appear} actions={laterReplies}>
            {storyLater(story.heard)}
          </BartenderBubble>
        )}
        {!story && others && settled && (
          <BartenderBubble
            className={appear}
            actions={
              <ReplyGroup>
                <ShowOthersRow {...others} />
              </ReplyGroup>
            }
          >
            {STORY_NONE}
          </BartenderBubble>
        )}
        {story?.pending && (
          <BartenderBubble
            actions={
              telling && (
                <ReplyGroup>
                  <ReplyRow>
                    <Reply tone="muted" onClick={story.skip}>
                      그만 들을게요
                    </Reply>
                  </ReplyRow>
                </ReplyGroup>
              )
            }
          >
            <span
              role="status"
              aria-label="이야기를 이어 가는 중"
              className="flex gap-4 py-6"
            >
              {[0, 150, 300].map((delay) => (
                <i
                  key={delay}
                  aria-hidden="true"
                  className="h-6 w-6 rounded-full bg-fg-neutral-muted motion-safe:animate-pulse"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </span>
          </BartenderBubble>
        )}
        <div ref={endRef} />
      </div>
      {/* 고를 목록이 아니라 대화라 FlowNavigation의 구분선을 두지 않는다 */}
      <nav aria-label="다른 보기" className="flex">
        <FlowTextAction onClick={home}>처음으로</FlowTextAction>
      </nav>
      <FlowDock>
        <div className="grid grid-cols-2 gap-8">
          <Link
            href={ROUTES.ALCOHOL.DETAIL(alcohol.id)}
            onClick={onLeave}
            className={buttonVariants({
              size: 'lg',
              variant: 'secondary',
              fullWidth: true,
            })}
          >
            자세히 볼게요
          </Link>
          <Button size="lg" variant="primary" onClick={onWriteReview}>
            리뷰 작성
          </Button>
        </div>
      </FlowDock>
      {story && (
        <BottomSheet
          isOpen={fullTextOpen}
          onClose={() => setFullTextOpen(false)}
          height={70}
          // 시트는 바텐더 화면 밖에 그려져 어두운 테마를 직접 건다
          className="dark"
        >
          {/* 대사가 끝나기 전에도 시트 안을 누르면 대사가 넘어가지 않게 한다 */}
          <div
            data-dialogue-control
            className="flex min-h-0 flex-1 flex-col gap-16 px-20 pb-[max(28px,var(--safe-area-bottom))] pt-16"
          >
            <div className="flex items-start gap-12">
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <span className="text-12 font-extrabold text-fg-brand">
                  이 술 이야기
                </span>
                <h3 className="m-0 break-keep text-17 font-extrabold leading-24">
                  {alcohol.name}
                </h3>
              </div>
              <button
                type="button"
                aria-label="닫기"
                onClick={() => setFullTextOpen(false)}
                className="grid h-40 w-40 shrink-0 place-items-center text-24 leading-none text-fg-neutral-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-stroke-focus-ring"
              >
                ×
              </button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-12 overflow-y-auto overscroll-contain">
              {story.paragraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  className="m-0 break-keep text-15 leading-24 text-fg-neutral"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </BottomSheet>
      )}
    </>
  );
}

function AlcoholCard({
  alcohol,
  label,
  isPicked,
  isTogglingPick,
  onTogglePick,
}: {
  alcohol: ReviewAlcohol;
  label: string;
  isPicked: boolean;
  isTogglingPick: boolean;
  onTogglePick: () => void;
}) {
  const metadata = [alcohol.category, alcohol.abv && `${alcohol.abv}%`]
    .filter(Boolean)
    .join(' · ');
  const tags = alcohol.tags.slice(0, TAG_LIMIT);
  return (
    <section
      aria-label={label}
      className="relative ml-34 flex items-center gap-12 rounded-xl border border-stroke-neutral-subtle bg-bg-neutral-weak p-10 motion-safe:duration-500 motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95"
    >
      <span aria-hidden="true">
        {alcohol.demoWhiskey ? (
          <WhiskeyImage whiskey={alcohol.demoWhiskey} size={64} />
        ) : (
          <AlcoholImage
            imageUrl={alcohol.imageUrl ?? ''}
            outerHeightClass="h-64"
            outerWidthClass="w-64"
            // 술 이미지는 여백을 둔 정사각형이라 안쪽도 정사각형으로 둬야 병이 작아지지 않는다
            innerHeightClass="h-58"
            innerWidthClass="w-58"
            priority
          />
        )}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2 pr-32">
        <p className="m-0 truncate text-11 font-extrabold text-fg-brand">
          {label}
        </p>
        <h1 className="m-0 line-clamp-2 break-keep text-17 font-extrabold leading-22">
          {alcohol.name}
        </h1>
        {metadata && (
          <p className="m-0 text-12 text-fg-neutral-muted">{metadata}</p>
        )}
        <p
          className={`m-0 text-12 ${alcohol.rating === null ? 'text-fg-neutral-muted' : 'text-fg-rating'}`}
        >
          {alcohol.rating === null
            ? '아직 평가가 없어요'
            : `★ ${alcohol.rating.toFixed(1)}${alcohol.reviewCount ? ` · 리뷰 ${alcohol.reviewCount}건` : ''}`}
        </p>
        {tags.length > 0 && (
          <ul
            aria-label="테이스팅 태그"
            className="m-0 mt-3 flex list-none flex-wrap gap-4 p-0"
          >
            {tags.map((tag) => (
              <li
                key={tag}
                className="rounded bg-bg-brand-weak px-6 py-2 text-11 leading-15 text-fg-brand"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}
      </div>
      <button
        type="button"
        aria-label={isPicked ? '찜 취소' : '찜하기'}
        aria-pressed={isPicked}
        disabled={isTogglingPick}
        onClick={onTogglePick}
        className="absolute right-0 top-0 grid h-40 w-40 place-items-center text-fg-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-stroke-focus-ring disabled:opacity-45"
      >
        <Heart
          aria-hidden="true"
          className="h-18 w-18"
          fill={isPicked ? 'currentColor' : 'none'}
        />
      </button>
    </section>
  );
}

function BartenderBubble({
  children,
  actions,
  className = '',
}: {
  children: ReactNode;
  /** 이 말에 대한 내 대답 버튼. 말풍선 아랫단에 단다. */
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex max-w-[300px] items-start gap-8 ${className}`}>
      <span
        aria-hidden="true"
        className="grid h-26 w-26 shrink-0 place-items-center rounded-full bg-bg-brand-solid text-10 font-extrabold text-fg-brand-contrast"
      >
        노트
      </span>
      <div className="min-w-0 overflow-hidden rounded-[4px_14px_14px_14px] bg-bg-neutral-weak">
        <p className="m-0 break-keep px-12 py-9 text-14 leading-21">
          <span className="sr-only">노트: </span>
          {children}
        </p>
        {actions}
      </div>
    </div>
  );
}

function Message({
  message,
  actions,
}: {
  message: StoryMessage;
  actions: ReactNode;
}) {
  if (message.from === 'bartender')
    return (
      <BartenderBubble className={appear} actions={actions}>
        {message.text}
      </BartenderBubble>
    );
  return (
    <p
      className={`m-0 self-end rounded-[14px_4px_14px_14px] bg-bg-brand-weak px-12 py-7 text-14 font-bold leading-20 text-fg-brand ${appear}`}
    >
      <span className="sr-only">나: </span>
      {message.text}
    </p>
  );
}

const replyTone = {
  primary: 'text-fg-brand',
  muted: 'text-fg-neutral-muted',
};

function Reply({
  tone,
  onClick,
  children,
}: {
  tone: keyof typeof replyTone;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-40 flex-1 items-center justify-center gap-4 whitespace-nowrap border-l border-stroke-neutral-subtle px-12 text-13 font-bold transition-colors first:border-l-0 hover:bg-bg-brand-weak focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-stroke-focus-ring ${replyTone[tone]}`}
    >
      {children}
    </button>
  );
}

function ReplyGroup({ children }: { children: ReactNode }) {
  return (
    <div
      role="group"
      aria-label="내 대답"
      className={`flex flex-col border-t border-stroke-neutral-subtle ${appear}`}
    >
      {children}
    </div>
  );
}

function ReplyRow({ children }: { children: ReactNode }) {
  return (
    <div className="flex border-t border-stroke-neutral-subtle first:border-t-0">
      {children}
    </div>
  );
}

function ShowOthersRow({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <ReplyRow>
      <Reply tone="primary" onClick={onClick}>
        {label}
        <span aria-hidden="true">›</span>
      </Reply>
    </ReplyRow>
  );
}

/** 이야기에 대한 내 대답. 진행에 따라 듣기·다시 듣기로 바뀌고, 돌아갈 목록이 있으면 함께 내놓는다. */
function StoryReplies({
  story,
  onOpenFullText,
  others,
}: {
  story: AlcoholStory;
  onOpenFullText: () => void;
  others?: { label: string; onClick: () => void };
}) {
  return (
    <ReplyGroup>
      <ReplyRow>
        {story.phase === 'offer' ? (
          <>
            <Reply tone="muted" onClick={story.skip}>
              다음에요
            </Reply>
            <Reply tone="primary" onClick={story.listen}>
              들려주세요
            </Reply>
          </>
        ) : (
          <>
            <Reply tone="primary" onClick={story.listen}>
              {story.heard ? '다시 듣기' : '이야기 듣기'}
            </Reply>
            <Reply tone="primary" onClick={onOpenFullText}>
              전체 글 보기
            </Reply>
          </>
        )}
      </ReplyRow>
      {others && <ShowOthersRow {...others} />}
    </ReplyGroup>
  );
}

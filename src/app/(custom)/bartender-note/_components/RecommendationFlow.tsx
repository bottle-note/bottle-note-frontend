import { useState, type Dispatch, type SetStateAction } from 'react';
import AlcoholImage from '@/components/domain/alcohol/AlcoholImage';
import type { AlcoholLookupItem } from '@/api/alcohol/types';
import { ROUTES } from '@/constants/routes';
import type { Answers, Step } from './types';
import { OptionList, FlowAction, FlowLink } from './FlowControls';
import { WhiskeyImage, WhiskeyRow } from './WhiskeyRow';
import type { Curation, Whiskey } from '../_data/demo';
import type { RecommendationMeta } from '../_data/demoSelection';

const levels = [
  ['위스키 잘 몰라요', '무난하고 평이 좋은 쪽으로 골라 드려요'],
  ['몇 번 마셔봤어요', '익숙한 것과 새로운 것을 섞어 드려요'],
  ['자주 마시는 편이에요', '덜 알려진 것, 도수 있는 것도 넣어 드려요'],
] as const;
const kinds = [
  ['싱글 몰트', '한 증류소의 보리 원액 · 글렌피딕, 맥캘란'],
  ['블렌디드', '여러 원액을 섞은 · 조니워커, 발렌타인'],
  ['버번', '새 오크통의 단맛 · 메이커스 마크, 버팔로 트레이스'],
  ['라이', '호밀의 알싸함 · 불렛 라이, 우드포드 리저브'],
  ['상관없어요', '종류는 따지지 않고 고를게요'],
] as const;
const axes = [
  ['피트·스모키', '모닥불과 바닷바람 같은 향'],
  ['셰리·건과일', '건포도와 초콜릿 같은 깊은 단맛'],
  ['바닐라·꿀', '버번 통에서 오는 바닐라와 꿀의 단맛'],
  ['과일·꽃', '사과와 꽃 같은 산뜻한 향'],
  ['스파이시', '후추와 시나몬 같은 향신료'],
  ['상관없어요', '나머지는 바텐더에게 맡길게요'],
] as const;
const americanAxes = [
  ['바닐라·캐러멜', '새 오크통에서 오는 바닐라 단맛'],
  ['스파이시·호밀', '호밀에서 오는 후추 같은 알싸함'],
  ['체리·과일', '체리와 오렌지 같은 과일 단맛'],
  ['진한 오크·가죽', '오래 숙성한 묵직한 오크 향'],
  ['부드러운·밀', '호밀 대신 밀을 넣은 순한 맛'],
  ['상관없어요', '나머지는 바텐더에게 맡길게요'],
] as const;
const abvs = [
  '43% 이하 · 편하게',
  '44~46% · 적당히',
  '47% 이상 · 세게',
  '상관없어요',
];
const prices = {
  glass: [
    '1.5만 원 이하',
    '1.5~2.5만 원',
    '2.5~4만 원',
    '4만 원 이상',
    '상관없어요',
  ],
  bottle: [
    '5만 원 이하',
    '5~10만 원',
    '10~20만 원',
    '20만 원 이상',
    '상관없어요',
  ],
};

type Props = {
  step: Step;
  answers: Answers;
  updateAnswers: (value: Partial<Answers>) => void;
  whiskies: Whiskey[];
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  searchResults: Whiskey[];
  lookupResults: AlcoholLookupItem[];
  lookupLoading: boolean;
  lookupError: boolean;
  retryLookup: () => void;
  likedLookups: AlcoholLookupItem[];
  rememberLookup: (item: AlcoholLookupItem) => void;
  listed: Whiskey[];
  exactCount: number;
  similarCount: number;
  recommendationMeta: Map<number, RecommendationMeta>;
  selected?: Whiskey;
  curation?: Curation;
  favorites: number[];
  move: (next: Step) => void;
  home: () => void;
  back: () => void;
  chooseWhiskey: (whiskey: Whiskey, next: Step) => void;
  toggleFavorite: (id: number) => void;
  onSelectDetail: () => void;
};

export default function RecommendationFlow({
  step,
  answers,
  updateAnswers,
  whiskies,
  query,
  setQuery,
  searchResults,
  lookupResults,
  lookupLoading,
  lookupError,
  retryLookup,
  likedLookups,
  rememberLookup,
  listed,
  exactCount,
  similarCount,
  recommendationMeta,
  selected,
  curation,
  favorites,
  move,
  home,
  back,
  chooseWhiskey,
  toggleFavorite,
  onSelectDetail,
}: Props) {
  const [showAllTags, setShowAllTags] = useState(false);
  const optionList = (items: Parameters<typeof OptionList>[0]['items']) => (
    <OptionList items={items} />
  );
  const action = (
    label: string,
    onClick: () => void,
    primary = false,
    disabled = false,
  ) => (
    <FlowAction onClick={onClick} primary={primary} disabled={disabled}>
      {label}
    </FlowAction>
  );
  return (
    <>
      {step === 'level' &&
        optionList(
          levels.map(([title, description]) => ({
            title,
            description,
            action: () => {
              updateAnswers({ level: title });
              move('likes');
            },
          })),
        )}
      {step === 'likes' && (
        <>
          <input
            className="h-46 w-full rounded-lg border border-stroke-neutral-weak bg-bg-neutral-weak px-14 text-16 text-fg-neutral outline-none placeholder:text-fg-placeholder focus-visible:border-stroke-focus-ring focus-visible:ring-2 focus-visible:ring-stroke-focus-ring disabled:cursor-not-allowed disabled:opacity-60"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="마셔본 술 이름 검색"
            aria-label="마셔본 술 이름 검색"
            disabled={answers.likedIds.length >= 3}
          />
          <p className="m-0 text-13 leading-17 text-fg-neutral-muted">
            {answers.likedIds.length >= 3
              ? '3/3병 · 다른 술을 고르려면 선택한 술을 빼 주세요'
              : `${answers.likedIds.length}/3병 · 선택 사항`}
          </p>
          <div className="flex flex-wrap gap-5">
            {answers.likedIds.map((id) => {
              const item = whiskies.find((whiskey) => whiskey.id === id);
              const lookupItem = likedLookups.find(
                (whiskey) => whiskey.alcoholId === id,
              );
              return (
                (item || lookupItem) && (
                  <button
                    type="button"
                    key={id}
                    className="rounded border border-stroke-brand-solid bg-bg-brand-weak px-7 py-4 text-12 leading-15 text-fg-brand"
                    onClick={() =>
                      updateAnswers({
                        likedIds: answers.likedIds.filter(
                          (value) => value !== id,
                        ),
                      })
                    }
                  >
                    {lookupItem?.korName ?? item?.name} ×
                  </button>
                )
              );
            })}
          </div>
          {!query && answers.likedIds.length < 3 && (
            <div className="flex flex-wrap gap-6">
              {[...searchResults]
                .sort((a, b) =>
                  answers.level === '자주 마시는 편이에요'
                    ? (b.rating ?? 0) - (a.rating ?? 0)
                    : 0,
                )
                .slice(0, 10)
                .map((whiskey) => (
                  <button
                    key={whiskey.id}
                    type="button"
                    className="rounded-full border border-stroke-neutral-weak px-10 py-6 text-13 text-fg-neutral"
                    onClick={() => {
                      if (
                        !answers.likedIds.includes(whiskey.id) &&
                        answers.likedIds.length < 3
                      )
                        updateAnswers({
                          likedIds: [...answers.likedIds, whiskey.id],
                        });
                      setQuery('');
                    }}
                  >
                    {whiskey.name}
                  </button>
                ))}
            </div>
          )}
          {query && !lookupLoading && !lookupError && (
            <p className="m-0 text-13 text-fg-neutral-muted">
              검색 결과 {lookupResults.length}개
              {lookupResults.length === 6 ? ' · 이름을 더 적으면 좁혀져요' : ''}
            </p>
          )}
          {query && lookupLoading && (
            <p className="text-14 text-fg-neutral-muted" role="status">
              술을 찾고 있어요…
            </p>
          )}
          {query && !lookupLoading && lookupError && (
            <div className="flex items-center gap-10 text-14 text-fg-neutral-muted">
              <span>검색 중 문제가 생겼어요.</span>
              <button
                type="button"
                className="text-fg-brand underline"
                onClick={retryLookup}
              >
                다시 시도
              </button>
            </div>
          )}
          {query &&
            !lookupLoading &&
            !lookupError &&
            lookupResults.length === 0 && (
              <p className="text-15 text-fg-neutral">
                그 이름으로는 못 찾겠네요. 철자를 조금 바꿔 보시겠어요?
              </p>
            )}
          {query && !lookupLoading && !lookupError && (
            <div className="flex flex-col">
              {lookupResults.map((whiskey) => (
                <button
                  key={whiskey.alcoholId}
                  type="button"
                  className="flex min-h-74 w-full items-center gap-12 border-b border-stroke-neutral-subtle py-10 text-left text-fg-neutral transition-colors hover:text-fg-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-stroke-focus-ring"
                  onClick={() => {
                    if (
                      !answers.likedIds.includes(whiskey.alcoholId) &&
                      answers.likedIds.length < 3
                    ) {
                      updateAnswers({
                        likedIds: [...answers.likedIds, whiskey.alcoholId],
                      });
                      rememberLookup(whiskey);
                    }
                    setQuery('');
                  }}
                >
                  <AlcoholImage
                    imageUrl={whiskey.imageUrl}
                    outerHeightClass="h-44"
                    outerWidthClass="w-44"
                    innerHeightClass="h-36"
                    innerWidthClass="w-24"
                  />
                  <span className="flex min-w-0 flex-1 flex-col gap-3">
                    <b className="text-14 font-bold leading-18">
                      {whiskey.korName}
                    </b>
                    <small className="text-12 leading-16 text-fg-neutral-muted">
                      {whiskey.korCategoryName}
                      {whiskey.engName ? ` · ${whiskey.engName}` : ''}
                    </small>
                  </span>
                </button>
              ))}
            </div>
          )}
          {action(
            answers.likedIds.length ? '이 술을 기억할게요' : '건너뛸게요',
            () => move('kind'),
            true,
          )}
        </>
      )}
      {step === 'kind' &&
        optionList(
          kinds.map(([title, description]) => ({
            title,
            description,
            action: () => {
              updateAnswers({ kind: title });
              move('axis');
            },
          })),
        )}
      {step === 'axis' &&
        optionList(
          (answers.kind === '버번' || answers.kind === '라이'
            ? americanAxes.filter(
                ([title]) => answers.kind !== '라이' || title !== '부드러운·밀',
              )
            : axes
          ).map(([title, description]) => ({
            title,
            description,
            action: () => {
              updateAnswers({ axis: title });
              move('abv');
            },
          })),
        )}
      {step === 'abv' &&
        optionList(
          abvs.map((title) => ({
            title,
            action: () => {
              updateAnswers({ abv: title });
              move('price');
            },
          })),
        )}
      {step === 'price' && (
        <>
          <div
            className="grid grid-cols-2 gap-4 rounded-lg bg-bg-neutral-weak p-4 [&>button]:min-h-40 [&>button]:rounded-md [&>button]:text-13 [&>button]:text-fg-neutral-muted [&>button[aria-pressed=true]]:bg-bg-brand-weak [&>button[aria-pressed=true]]:font-bold [&>button[aria-pressed=true]]:text-fg-brand"
            role="group"
            aria-label="가격 기준"
          >
            <button
              type="button"
              aria-pressed={answers.unit === 'glass'}
              onClick={() => updateAnswers({ unit: 'glass' })}
            >
              바에서 한 잔
            </button>
            <button
              type="button"
              aria-pressed={answers.unit === 'bottle'}
              onClick={() => updateAnswers({ unit: 'bottle' })}
            >
              병으로 살 때
            </button>
          </div>
          {optionList(
            prices[answers.unit].map((title) => ({
              title,
              action: () => {
                updateAnswers({ price: title });
                move('recommendations');
              },
            })),
          )}
        </>
      )}
      {(step === 'recommendations' ||
        step === 'similar' ||
        step === 'curation-list' ||
        step === 'favorites') && (
        <>
          <p className="m-0 text-13 font-extrabold text-fg-brand">
            {step === 'curation-list'
              ? curation?.title
              : step === 'favorites'
                ? `찜한 술 ${listed.length}병`
                : step === 'recommendations' &&
                    exactCount === 0 &&
                    listed.length === 0
                  ? '추천할 술이 없어요'
                  : step === 'similar' ||
                      (step === 'recommendations' && exactCount === 0)
                    ? '비슷한 술'
                    : `추천 ${listed.length}병`}
          </p>
          {step === 'recommendations' && exactCount > 0 && (
            <p className="m-0 text-13 text-fg-neutral-muted">
              {[
                answers.kind !== '상관없어요' ? answers.kind : '',
                answers.axis !== '상관없어요' ? answers.axis : '',
                answers.abv !== '상관없어요' ? answers.abv.split(' · ')[0] : '',
                answers.price !== '상관없어요' ? answers.price : '',
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          )}
          {listed.length === 0 && (
            <p className="text-15 text-fg-neutral">
              보여 드릴 병이 없어요. 조건을 바꿔 다시 골라 볼까요?
            </p>
          )}
          <p className="m-0 text-13 text-fg-neutral-muted">
            술을 누르면{' '}
            {step === 'curation-list'
              ? '자세한 정보'
              : '추천 이유와 자세한 정보'}
            를 볼 수 있어요.
          </p>
          <div className="flex flex-col">
            {listed.map((whiskey, index) => (
              <WhiskeyRow
                key={whiskey.id}
                whiskey={whiskey}
                rank={index + 1}
                hit={
                  step === 'curation-list' || step === 'favorites'
                    ? []
                    : recommendationMeta.get(whiskey.id)?.hit
                }
                miss={
                  step === 'similar' ||
                  (step === 'recommendations' && exactCount === 0)
                    ? recommendationMeta.get(whiskey.id)?.miss
                    : []
                }
                showPrice
                priceUnit={
                  step === 'curation-list'
                    ? curation?.unit ?? 'glass'
                    : answers.unit
                }
                onClick={() => {
                  setShowAllTags(false);
                  onSelectDetail();
                  chooseWhiskey(whiskey, 'detail');
                }}
              />
            ))}
          </div>
          {step === 'recommendations' &&
            exactCount > 0 &&
            exactCount < 10 &&
            similarCount > 0 &&
            action('비슷한 술도 볼게요', () => move('similar'))}
          {step === 'curation-list' &&
            action('다른 주제 볼게요', () => move('situation'))}
          {step === 'curation-list' && curation && (
            <FlowLink href={ROUTES.CURATION.DETAIL(curation.id)}>
              큐레이션 전체 보기
            </FlowLink>
          )}
          {action('처음으로 갈게요', home)}
        </>
      )}
      {step === 'detail' && selected && (
        <>
          <div className="rounded-xl bg-bg-neutral-weak p-14">
            <div className="flex items-center gap-12">
              <WhiskeyImage whiskey={selected} size={64} />
              <h1 className="text-18 font-extrabold leading-24">
                {selected.name}
              </h1>
            </div>
            <dl className="my-14 grid grid-cols-[78px_1fr] gap-y-6 text-13">
              <dt className="text-fg-neutral-muted">종류·도수</dt>
              <dd>
                {selected.category} · {selected.region} · {selected.abv}%
              </dd>
              <dt className="text-fg-neutral-muted">유저평균</dt>
              <dd className={selected.rating === null ? '' : 'text-fg-rating'}>
                {selected.rating === null
                  ? '평가 없음'
                  : `★ ${selected.rating.toFixed(1)}${selected.ratingCount ? ` · 평가 ${selected.ratingCount}건` : ''}${selected.reviewCount ? ` · 리뷰 ${selected.reviewCount}건` : ''}`}
              </dd>
              <dt className="text-fg-neutral-muted">대략 가격</dt>
              <dd>
                {selected.glassPrice
                  ? `한 잔 ${selected.glassPrice.toLocaleString()}원`
                  : '정보 없음'}{' '}
                ·{' '}
                {selected.bottlePrice
                  ? `한 병 ${selected.bottlePrice.toLocaleString()}원`
                  : '정보 없음'}
              </dd>
            </dl>
            <div className="flex flex-wrap gap-5">
              {selected.tags
                .slice(0, showAllTags ? undefined : 8)
                .map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-bg-brand-weak px-7 py-4 text-11 leading-15 text-fg-brand"
                  >
                    {tag}
                  </span>
                ))}
              {selected.tags.length > 8 && (
                <button
                  type="button"
                  className="text-13 font-bold text-fg-brand"
                  onClick={() => setShowAllTags(!showAllTags)}
                >
                  {showAllTags
                    ? '접기'
                    : `${selected.tags.length - 8}개 더보기`}
                </button>
              )}
            </div>
            {selected.glassPrice && (
              <p className="mb-0 text-12 text-fg-neutral-muted">
                바 한 잔 가격은 매장마다 다를 수 있어요.
              </p>
            )}
          </div>
          <FlowLink primary href={ROUTES.ALCOHOL.DETAIL(selected.id)}>
            자세히 볼게요
          </FlowLink>
          <div className="grid grid-cols-2 gap-6">
            {action(
              favorites.includes(selected.id) ? '♥ 찜했어요' : '♡ 찜해둘게요',
              () => toggleFavorite(selected.id),
            )}
            {action('리뷰 작성', () => move('review-mode'))}
          </div>
          {action('‹ 후보 목록으로', back)}
        </>
      )}
    </>
  );
}

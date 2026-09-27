/* eslint-disable @next/next/no-img-element */
import type {
  TastingEventPreviewAlcoholItem,
  TastingEventPreviewData,
  TastingEventPreviewModel,
} from './types';
import { buildTastingEventPreviewModel } from './buildTastingEventPreviewModel';

const cx = (...classNames: Array<string | false | null | undefined>) => {
  return classNames.filter(Boolean).join(' ');
};

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" className="h-14 w-14" aria-hidden="true">
    <path
      d="M7 2v3M17 2v3M4 9h16M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
);

const PinIcon = () => (
  <svg viewBox="0 0 24 24" className="h-14 w-14" aria-hidden="true">
    <path
      d="M12 21s7-5.4 7-12a7 7 0 1 0-14 0c0 6.6 7 12 7 12Z"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
    <circle
      cx="12"
      cy="9"
      r="2.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" className="h-14 w-14" aria-hidden="true">
    <path
      d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M9.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" className="h-12 w-12" aria-hidden="true">
    <path
      d="m12 2 3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2Z"
      fill="currentColor"
    />
  </svg>
);

interface TastingEventPreviewProps {
  event: TastingEventPreviewData;
  today?: Date;
  className?: string;
}

export function TastingEventPreview({
  event,
  today,
  className,
}: TastingEventPreviewProps) {
  const model = buildTastingEventPreviewModel(event, { today });

  return (
    <article className={cx('mx-auto max-w-468 bg-white', className)}>
      <TastingEventPreviewHero model={model} />
      <TastingEventPreviewInfoCard model={model} />
      <TastingEventPreviewDescription description={model.description} />
      <TastingEventPreviewGallery imageUrls={model.imageUrls} />
      <TastingEventPreviewLineup alcohols={model.alcohols} />
      <TastingEventPreviewCta model={model} />
    </article>
  );
}

function TastingEventPreviewHero({
  model,
}: {
  model: TastingEventPreviewModel;
}) {
  return (
    <section className="relative h-240 w-full overflow-hidden bg-sectionWhite">
      <img
        src={model.coverImageUrl}
        alt=""
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/70" />
      <div className="absolute bottom-20 left-20 right-20 text-black">
        <span className="inline-flex rounded-full bg-white/70 px-10 py-4 text-10 font-bold backdrop-blur-sm">
          시음회
        </span>
        <h1 className="mt-12 line-clamp-2 text-20 font-extrabold text-white">
          {model.title}
        </h1>
        <p className="mt-8 line-clamp-1 text-10 font-light text-white">
          {model.eventDateLabel} · {model.placeLabel} · {model.capacityLabel}
        </p>
      </div>
    </section>
  );
}

function TastingEventPreviewInfoCard({
  model,
}: {
  model: TastingEventPreviewModel;
}) {
  const infoItems = [
    {
      key: 'date',
      Icon: CalendarIcon,
      title: model.eventDateTimeLabel,
      description: model.guideText,
    },
    {
      key: 'place',
      Icon: PinIcon,
      title: model.placeLabel,
      description: model.fullAddress,
      actionHref: model.mapSearchUrl,
    },
    {
      key: 'capacity',
      Icon: UsersIcon,
      title: model.capacityLabel,
    },
  ];

  return (
    <section className="px-20 py-20">
      <div className="flex flex-col gap-8 rounded-2xl bg-bgGray px-16 py-16">
        <span className="inline-flex w-fit rounded-full bg-mainCoral px-10 py-4 text-[8px] font-bold text-white">
          시음회 정보
        </span>

        <div className="mt-8 flex h-full flex-col gap-16">
          {infoItems.map(({ key, Icon, title, description, actionHref }) => (
            <div key={key} className="flex gap-10">
              <span className="mt-2 flex h-14 w-14 shrink-0 items-center justify-center text-mainDarkGray">
                <Icon />
              </span>

              <div className="flex min-w-0 flex-1 flex-col gap-4">
                <div className="flex min-w-0 items-start gap-8">
                  <p className="min-w-0 flex-1 truncate text-11 font-bold text-mainDarkGray">
                    {title}
                  </p>
                  {actionHref && (
                    <a
                      href={actionHref}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 rounded-full bg-white px-8 py-2 text-10 font-bold leading-sm text-mainDarkGray"
                    >
                      지도보기
                    </a>
                  )}
                </div>
                {description && (
                  <p className="truncate text-10 font-light text-mainGray">
                    {description}
                  </p>
                )}
              </div>
            </div>
          ))}

          <div className="mt-auto flex items-end gap-8">
            <span className="text-10 font-semibold leading-none text-mainDarkGray">
              참가비
            </span>
            <span className="text-20 font-bold leading-none text-mainDarkGray">
              {model.entryFeeLabel}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function TastingEventPreviewDescription({
  description,
}: {
  description: string;
}) {
  return (
    <section className="px-20">
      <p className="whitespace-pre-line text-13 font-medium text-mainDarkGray">
        {description}
      </p>
    </section>
  );
}

function TastingEventPreviewGallery({ imageUrls }: { imageUrls: string[] }) {
  if (!imageUrls.length) {
    return null;
  }

  return (
    <section className="mt-20 flex w-full snap-x overflow-x-auto bg-sectionWhite">
      {imageUrls.map((imageUrl) => (
        <img
          key={imageUrl}
          src={imageUrl}
          alt=""
          className="h-240 w-full shrink-0 snap-start object-cover"
        />
      ))}
    </section>
  );
}

function TastingEventPreviewLineup({
  alcohols,
}: {
  alcohols: TastingEventPreviewAlcoholItem[];
}) {
  if (!alcohols.length) {
    return null;
  }

  return (
    <section className="px-20 py-24">
      <h2 className="text-16 font-extrabold text-mainDarkGray">
        시음회 라인업
      </h2>
      <div className="mt-16 divide-y divide-bgGray border-t border-bgGray">
        {alcohols.map((item, index) => (
          <TastingEventPreviewLineupItem
            key={
              item.source ??
              item.alcohol.alcoholId ??
              `${item.alcohol.korName}-${index}`
            }
            item={item}
            order={index + 1}
          />
        ))}
      </div>
    </section>
  );
}

function TastingEventPreviewLineupItem({
  item,
  order,
}: {
  item: TastingEventPreviewAlcoholItem;
  order: number;
}) {
  const { alcohol, stats, comment } = item;
  const details = [
    alcohol.abv && `도수 ${alcohol.abv}%`,
    alcohol.korCategory,
  ].filter(Boolean);
  const chips = [
    ...(alcohol.selectedTags ?? []),
    alcohol.korCategory,
    alcohol.regionName,
  ].filter(Boolean);

  return (
    <article className="relative py-24">
      <div className="absolute left-0 top-24 flex h-20 w-20 items-center justify-center rounded-full bg-mainDarkGray text-10 font-bold text-white">
        {order}
      </div>

      <div className="flex w-full overflow-hidden pl-32 text-mainBlack">
        <div className="flex min-w-0 flex-1 gap-12">
          <div className="flex h-128 w-95 shrink-0 items-center justify-center p-8">
            <div className="relative h-full w-full">
              <img
                src={alcohol.imageUrl ?? ''}
                alt={alcohol.korName}
                className="h-full w-full object-contain"
              />
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col items-start justify-center space-y-8">
            <div className="min-w-0 space-y-8">
              <h3 className="line-clamp-2 text-15 font-bold leading-[1.3] text-mainDarkGray">
                {alcohol.korName}
              </h3>
              {alcohol.engName && (
                <p className="line-clamp-1 text-13 text-mainDarkGray">
                  {alcohol.engName.toUpperCase()}
                </p>
              )}
              {details.length > 0 && (
                <p className="text-13 text-mainDarkGray">
                  {details.join(' · ')}
                </p>
              )}
            </div>

            {typeof stats?.rating === 'number' && (
              <div className="flex items-center gap-4 text-mainGray">
                <span className="text-12 font-medium">유저평균</span>
                <div className="flex items-center gap-1 text-12 font-semibold text-mainGray">
                  <StarIcon />
                  <span>{stats.rating.toFixed(1)}</span>
                  <span className="ml-2 text-11 font-medium">
                    ({stats.totalRatingsCount ?? 0})
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {chips.length > 0 && (
        <div className="mt-20 flex w-full flex-wrap gap-6">
          {chips.map((chip) => (
            <span
              key={chip}
              className="label-default border-mainGray px-8 py-4 text-11 font-medium text-mainGray"
            >
              {chip}
            </span>
          ))}
        </div>
      )}

      {comment && (
        <p className="mt-20 text-13 font-medium leading-[1.8] text-mainGray">
          {comment}
        </p>
      )}
    </article>
  );
}

function TastingEventPreviewCta({
  model,
}: {
  model: TastingEventPreviewModel;
}) {
  if (model.cta.type === 'hidden') {
    return null;
  }

  return (
    <section className="px-20 pb-32 pt-8">
      {model.cta.type === 'apply' ? (
        <a
          href={model.cta.href}
          target="_blank"
          rel="noreferrer"
          className="flex h-52 w-full items-center justify-center rounded-xl bg-subCoral"
        >
          <span className="text-15 font-bold text-white">
            {model.cta.label}
          </span>
        </a>
      ) : (
        <button
          type="button"
          disabled
          className="flex h-52 w-full cursor-not-allowed items-center justify-center rounded-xl bg-brightGray"
        >
          <span className="text-15 font-bold text-white">
            {model.cta.label}
          </span>
        </button>
      )}
    </section>
  );
}

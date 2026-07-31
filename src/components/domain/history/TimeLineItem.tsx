import Image from 'next/image';
import Link from 'next/link';
import {
  HISTORY_TYPE_INFO,
  DescriptionProps,
} from '@/app/(primary)/history/_components/HistoryDescription';
import BaseImage from '@/components/ui/Display/BaseImage';
import { formatDate } from '@/utils/formatDate';
import { truncStr } from '@/utils/truncStr';
import { TimeFormat } from '@/types/FormatDate';
import { Rate } from '@/types/History';

interface BaseProps {
  date: string;
  redirectUrl?: string;
  alcoholName?: string;
  imageSrc?: string;
  isStart?: boolean;
}

interface RatingProps extends BaseProps {
  type: 'START_RATING' | 'RATING_MODIFY';
  rate: Rate | null;
}

interface ReviewProps extends BaseProps {
  type:
    | 'REVIEW_CREATE'
    | 'REVIEW_LIKES'
    | 'REVIEW_REPLY_CREATE'
    | 'BEST_REVIEW_SELECTED';
  content?: string | undefined;
}

interface OtherProps extends BaseProps {
  type: 'BOTTLE' | 'UNPICK' | 'IS_PICK' | 'RATING_DELETE';
}

type Props = RatingProps | ReviewProps | OtherProps;

function TimeLineItem(props: Props) {
  const {
    date,
    alcoholName,
    imageSrc,
    type,
    isStart = false,
    rate,
    content,
    redirectUrl,
  } = props as RatingProps & ReviewProps;
  const { getIcon, iconAlt, renderDescription, needsRate, needsDescription } =
    HISTORY_TYPE_INFO[type];

  const getDescriptionProps = () => {
    const historyProps: DescriptionProps = {};
    if (needsRate) historyProps.rate = rate;
    if (needsDescription) historyProps.description = content;
    return historyProps;
  };

  const dateTime = formatDate(date, 'MONTH_DATE_TIME') as TimeFormat;

  return (
    <div
      data-testid="timeline-item"
      className="flex w-full items-start gap-2.5"
    >
      <div
        data-testid="timeline-date"
        className="flex w-6 shrink-0 flex-col items-end text-fg-neutral-muted"
      >
        <p className="text-10 font-medium">{dateTime.date}</p>
        <p className="text-9 font-extralight">{dateTime.time}</p>
      </div>
      <Image
        className="shrink-0"
        src={getIcon(rate)}
        width={20}
        height={20}
        alt={iconAlt}
        style={{ width: 20, height: 20 }}
      />
      {isStart ? (
        <div className="w-full max-w-[21rem] rounded-md bg-bg-brand-solid px-3 py-[0.65rem] text-12 font-bold text-fg-brand-contrast">
          보틀노트를 시작하신 날이에요.
        </div>
      ) : (
        <Link
          href={redirectUrl || '#'}
          className="min-w-0 w-full max-w-[21rem]"
        >
          <div className="flex h-14 w-full justify-between rounded-md bg-bg-neutral-weak p-3">
            <div>
              <p className="text-12 font-bold text-fg-neutral">
                {truncStr(alcoholName, 23)}
              </p>
              {renderDescription && renderDescription(getDescriptionProps())}
            </div>
            <BaseImage
              src={imageSrc}
              alt="alcohol image"
              priority
              className="rounded object-contain"
              width={25}
              height={34}
              fill
              sizes="25px"
            />
          </div>
        </Link>
      )}
    </div>
  );
}

export default TimeLineItem;

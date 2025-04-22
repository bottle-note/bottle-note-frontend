import Image from 'next/image';
import Link from 'next/link';
import {
  HISTORY_TYPE_INFO,
  DescriptionProps,
} from '@/app/(primary)/history/_components/filter/HistoryDescription';
import BaseImage from '@/components/BaseImage';
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
    <div className="flex items-start justify-between">
      <div className="text-mainGray flex flex-col items-end">
        <p className="text-10 font-medium">{dateTime.date}</p>
        <p className="text-9 font-extralight">{dateTime.time}</p>
      </div>
      <Image
        className="mr-1"
        src={getIcon(rate)}
        width={20}
        height={20}
        alt={iconAlt}
      />
      {isStart ? (
        <div className="w-[17rem] text-12 font-bold text-white bg-subCoral py-[0.65rem] px-3 rounded-md">
          보틀노트를 시작하신 날이에요.
        </div>
      ) : (
        <Link href={redirectUrl || '#'}>
          <div className="w-[17rem] h-14 p-3 bg-bgGray rounded-md flex justify-between">
            <div>
              <p className="text-12 font-bold text-mainDarkGray">
                {truncStr(alcoholName, 23)}
              </p>
              {renderDescription && renderDescription(getDescriptionProps())}
            </div>
            <BaseImage
              src={imageSrc}
              alt="alcohol image"
              priority
              className="rounded object-cover"
              width={25}
              height={34}
              fill
            />
          </div>
        </Link>
      )}
    </div>
  );
}

export default TimeLineItem;

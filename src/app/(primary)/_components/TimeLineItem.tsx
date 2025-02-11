import React from 'react';
import Image from 'next/image';
// import Link from 'next/link';
import { HISTORY_TYPE_INFO } from '@/constants/historyType';
import { formatDate } from '@/utils/formatDate';
import { TimeFormat } from '@/types/FormatDate';
import { Rate } from '@/types/History';

interface BaseProps {
  date: string;
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
  text: string | undefined;
}

interface OtherProps extends BaseProps {
  type: 'BOTTLE' | 'UNPICKED' | 'IS_PICK' | 'RATING_DELETE';
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
    text,
  } = props as RatingProps & ReviewProps;
  const { getIcon, iconAlt, renderDescription } = HISTORY_TYPE_INFO[type];
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
        // <Link href="">
        <div className="w-[17rem] h-14 p-3 bg-bgGray rounded-md flex justify-between">
          <div>
            <p className="text-12 font-bold text-mainDarkGray">{alcoholName}</p>
            {renderDescription &&
              renderDescription(
                ['START_RATING', 'RATING_MODIFY'].includes(type)
                  ? rate
                  : undefined,
                [
                  'REVIEW_CREATE',
                  'REVIEW_LIKES',
                  'REVIEW_REPLY_CREATE',
                  'BEST_REVIEW_SELECTED',
                ].includes(type)
                  ? text
                  : undefined,
              )}
          </div>
          {imageSrc && (
            <Image
              className="mr-1 rounded"
              src={imageSrc}
              width={25}
              height={34}
              alt="alcoholImage"
            />
          )}
        </div>
        // </Link>
      )}
    </div>
  );
}

export default TimeLineItem;

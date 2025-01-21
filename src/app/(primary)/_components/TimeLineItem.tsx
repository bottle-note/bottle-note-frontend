import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HISTORY_TYPE_INFO } from '@/constants/historyType';
import { formatDate } from '@/utils/formatDate';
import { TimeFormat } from '@/types/FormatDate';

interface BaseProps {
  date: string;
  alcoholName: string;
  imageSrc: string;
}

interface RatingProps extends BaseProps {
  type: 'RATING';
  rating: number | undefined;
}

interface ReviewProps extends BaseProps {
  type: 'REVIEW';
  text: string | undefined;
}

interface OtherProps extends BaseProps {
  type: 'LIKE' | 'UNLIKE' | 'REPLY'; // 서버 API에 맞춰 수정 필요
}

type Props = RatingProps | ReviewProps | OtherProps;

function TimeLineItem(props: Props) {
  const { date, alcoholName, imageSrc, type } = props;
  const { icon, iconAlt, renderDescription } = HISTORY_TYPE_INFO[type];
  const dateTime = formatDate(date, 'MONTH_DATE_TIME') as TimeFormat;

  return (
    <div className="flex items-start justify-between">
      <div className="text-mainGray flex flex-col items-end">
        <p className="text-10 font-medium">{dateTime.date}</p>
        <p className="text-9 font-extralight">{dateTime.time}</p>
      </div>
      <Image className="mr-1" src={icon} width={20} height={20} alt={iconAlt} />
      <Link href="">
        <div className="w-[17rem] h-14 p-3 bg-bgGray rounded-md flex justify-between">
          <div>
            <p className="text-12 font-bold text-mainDarkGray">{alcoholName}</p>
            {renderDescription(
              type === 'RATING' ? props?.rating : undefined,
              type === 'REVIEW' ? props?.text : undefined,
            )}
          </div>
          <Image
            className="mr-1 rounded"
            src={imageSrc}
            width={25}
            height={34}
            alt="alcoholImage"
          />
        </div>
      </Link>
    </div>
  );
}

export default TimeLineItem;

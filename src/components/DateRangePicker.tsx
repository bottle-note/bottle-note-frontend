import React, { useState } from 'react';
import Image from 'next/image';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import CalendarSubcoralIcon from 'public/icon/calendar-subcoral.svg';
import 'react-datepicker/dist/react-datepicker.css';

interface Props {
  startDate: Date;
  endDate: Date;
  onChange: (start: Date, end: Date) => void;
  description?: string;
}

export default function DateRangePicker({
  startDate,
  endDate,
  onChange,
  description = '최대 2년까지 기간 조회가 가능해요.',
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const isWithinRange = (date: Date) => {
    if (!startDate || !date) return false;

    const compareDate = new Date(date.toDateString());
    const compareStart = new Date(startDate.toDateString());
    const compareEnd = endDate ? new Date(endDate.toDateString()) : null;

    if (!compareEnd) return compareDate.getTime() === compareStart.getTime();
    return compareDate >= compareStart && compareDate <= compareEnd;
  };

  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 2);

  return (
    <div className="relative">
      <div className="rounded-lg border border-mainCoral py-2 px-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center">
            <span className="text-mainCoral text-12">
              {format(startDate, 'yy.MM.dd')}
            </span>
            <button onClick={() => setIsOpen(true)} className="ml-2">
              <Image src={CalendarSubcoralIcon} alt="calendar" />
            </button>
          </div>
          <span className="text-black text-12">~</span>
          <div className="flex items-center">
            <span className="text-mainCoral text-12">
              {format(endDate, 'yy.MM.dd')}
            </span>
            <button onClick={() => setIsOpen(true)} className="ml-2">
              <Image src={CalendarSubcoralIcon} alt="calendar" />
            </button>
          </div>
        </div>
      </div>

      <div className="text-10 text-brightGray text-center py-2">
        {description}
      </div>

      {isOpen && (
        <DatePicker
          locale={ko}
          selected={startDate}
          onChange={(dates) => {
            const [start, end] = dates;
            if (start && end) {
              onChange(start, end);
            }
            setIsOpen(false);
          }}
          startDate={startDate}
          endDate={endDate}
          selectsRange
          inline
          maxDate={maxDate}
          dateFormat="yy.MM.dd"
          wrapperClassName="w-full"
          calendarClassName="bg-white !border-mainCoral rounded-lg shadow-lg"
          dayClassName={(date) => {
            if (!date) return '';
            if (isWithinRange(date)) {
              return '!bg-mainCoral !text-white !rounded-full';
            }
            return '!rounded-full';
          }}
          monthClassName={() => '!text-white'}
          weekDayClassName={() => '!text-white'}
        />
      )}
    </div>
  );
}

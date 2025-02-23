import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import CalendarSubcoralIcon from 'public/icon/calendar-subcoral.svg';
import 'react-datepicker/dist/react-datepicker.css';

interface Props {
  startDate: Date;
  endDate: Date;
  onChange: (start: Date | null, end: Date | null) => void;
  minDate: Date;
  maxDate: Date;
  description?: string;
}

export default function DateRangePicker({
  startDate,
  endDate,
  onChange,
  minDate,
  maxDate,
  description = '최대 2년까지 기간 조회가 가능해요.',
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={ref}>
      <div className="rounded-lg border border-mainCoral py-2 px-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center">
            <span className="text-mainCoral text-12">
              {format(startDate, 'yy.MM.dd')}
            </span>
            <button onClick={() => setIsOpen((prev) => !prev)} className="ml-2">
              <Image src={CalendarSubcoralIcon} alt="calendar" />
            </button>
          </div>
          <span className="text-black text-12">~</span>
          <div className="flex items-center">
            <span className="text-mainCoral text-12">
              {format(endDate, 'yy.MM.dd')}
            </span>
            <button onClick={() => setIsOpen((prev) => !prev)} className="ml-2">
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
          monthClassName={() => '!text-white'}
          weekDayClassName={() => '!text-white'}
          onChange={(dates) => {
            const [start, end] = dates;
            onChange(start, end);
          }}
          startDate={startDate}
          endDate={endDate}
          selectsRange
          inline
          minDate={minDate}
          maxDate={maxDate}
          dateFormat="yy.MM.dd"
          wrapperClassName="w-full"
          calendarClassName="bg-white !border-mainCoral rounded-lg shadow-lg"
          dayClassName={(date) => {
            if (!date) return '';
            if (
              startDate &&
              format(startDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
            ) {
              return '!bg-mainCoral !text-white !rounded-l-full';
            }
            if (
              endDate &&
              format(endDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
            ) {
              return '!bg-mainCoral !text-white !rounded-r-full';
            }
            if (startDate && endDate && date > startDate && date < endDate) {
              return '!bg-mainCoral !text-white';
            }
            return '!rounded-full';
          }}
        />
      )}
    </div>
  );
}

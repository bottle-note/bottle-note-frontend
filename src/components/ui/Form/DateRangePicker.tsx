import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import DatePicker from 'react-datepicker';
import { format, isAfter, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import CalendarSubcoralIcon from 'public/icon/calendar-subcoral.svg';
import 'react-datepicker/dist/react-datepicker.css';

interface Props {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (start: Date | null, end: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  description?: string;
}

export default function DateRangePicker({
  startDate,
  endDate,
  onChange,
  minDate,
  maxDate,
  description,
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

      setTimeout(() => {
        ref.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 100);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const hasDate = Boolean(startDate || endDate);
  const isSelectingEnd = Boolean(startDate) && !endDate;

  // 시작일이 없으면 시작일, 시작일만 있으면 종료일을 채운다.
  // 시작일보다 앞선 날짜를 누르거나 두 날짜가 모두 있으면 새 시작일로 다시 고른다.
  const handleSelect = (date: Date | null) => {
    if (!date) return;

    if (!startDate) {
      onChange(
        date,
        endDate && isOnOrBeforeDay(date, endDate) ? endDate : null,
      );
      return;
    }

    if (!endDate && isOnOrBeforeDay(startDate, date)) {
      onChange(startDate, date);
      return;
    }

    onChange(date, null);
  };

  return (
    <div className="relative" ref={ref}>
      <div className="flex items-center gap-12 rounded-lg border border-mainCoral py-8 px-16">
        <div className="flex flex-1 items-center justify-between gap-16">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex items-center"
          >
            <span className="text-mainCoral text-12">
              {startDate ? format(startDate, 'yy.MM.dd') : 'YY.MM.DD'}
            </span>
            <Image
              src={CalendarSubcoralIcon}
              alt=""
              aria-hidden
              className="ml-8 h-14 w-14 shrink-0"
            />
          </button>
          <span className="text-12 text-fg-neutral">~</span>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex items-center"
          >
            <span className="text-mainCoral text-12">
              {endDate ? format(endDate, 'yy.MM.dd') : 'YY.MM.DD'}
            </span>
            <Image
              src={CalendarSubcoralIcon}
              alt=""
              aria-hidden
              className="ml-8 h-14 w-14 shrink-0"
            />
          </button>
        </div>
        {/* 날짜가 없을 때도 자리를 유지해 날짜를 고를 때 입력칸 배치가 흔들리지 않게 한다. */}
        <button
          type="button"
          aria-label="기간 지우기"
          disabled={!hasDate}
          onClick={() => onChange(null, null)}
          className={cn(
            'flex shrink-0 items-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stroke-focus-ring',
            !hasDate && 'invisible',
          )}
        >
          <X aria-hidden className="h-14 w-14 text-fg-neutral-muted" />
        </button>
      </div>

      {description && (
        <div className="text-10 text-brightGray text-center py-8">
          {description}
        </div>
      )}

      {isOpen && (
        <DatePicker
          locale={ko}
          monthClassName={() => '!text-white'}
          weekDayClassName={() => '!text-white'}
          onChange={handleSelect}
          selected={startDate}
          startDate={startDate}
          endDate={endDate}
          selectsStart={!isSelectingEnd}
          selectsEnd={isSelectingEnd}
          allowSameDay
          inline
          minDate={minDate}
          maxDate={maxDate}
          dateFormat="yy.MM.dd"
          dateFormatCalendar="yyyy년 M월"
          wrapperClassName="w-full"
          calendarClassName={cn(
            'bg-white !border-mainCoral rounded-lg shadow-lg',
            !description && 'mt-8',
          )}
          dayClassName={(date) => {
            if (!date) return '';
            const isStart = startDate && isSameDay(date, startDate);
            const isEnd = endDate && isSameDay(date, endDate);
            // 기간이 이어지지 않는 날짜(시작일만 있거나 시작일과 종료일이 같은 날)는 원으로 표시한다.
            const hasRange =
              startDate && endDate && !isSameDay(startDate, endDate);

            if (isStart || isEnd) {
              if (!hasRange) return '!bg-mainCoral !text-white !rounded-full';
              return isStart
                ? '!bg-mainCoral !text-white !rounded-l-full'
                : '!bg-mainCoral !text-white !rounded-r-full';
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

// 호출부가 시각이 포함된 날짜(예: 2년 전 현재 시각)를 넘길 수 있어 일 단위로 비교한다.
function isOnOrBeforeDay(date: Date, target: Date) {
  return isSameDay(date, target) || !isAfter(date, target);
}

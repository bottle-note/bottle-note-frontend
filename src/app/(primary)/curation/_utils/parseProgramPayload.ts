import type {
  ProgramFeedPayload,
  ProgramPayload,
  ProgramTag,
  ProgramType,
} from '@/api/curation-v2/types';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const PROGRAM_TYPE_LABELS: Record<ProgramType, string> = {
  MASTER_CLASS: '마스터 클래스',
  TASTING: '테이스팅',
  SEMINAR: '세미나',
  BOOTH_EVENT: '부스 이벤트',
  OTHER: '기타',
};

const PROGRAM_TAG_LABELS: Record<ProgramTag, string> = {
  WHISKY: '위스키',
  TRADITIONAL_LIQUOR: '전통주',
  WINE: '와인',
  COCKTAIL: '칵테일',
  BEER: '맥주',
  OTHER_SPIRITS: '기타 주류',
};

const toDate = (value: string) => new Date(`${value}T00:00:00`);

export const formatProgramDate = (value: string) => {
  const date = toDate(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAYS[date.getDay()]})`;
};

export const formatProgramDateRange = (startDate: string, endDate: string) => {
  const start = formatProgramDate(startDate);

  return startDate === endDate
    ? start
    : `${start} ~ ${formatProgramDate(endDate)}`;
};

export const formatProgramTime = (
  startTime: string,
  endTime?: string | null,
) => (endTime ? `${startTime} - ${endTime}` : startTime);

export const formatProgramFee = (entryFee?: number | null) => {
  if (entryFee === null || entryFee === undefined) {
    return '참가비 별도 안내';
  }

  return entryFee === 0 ? '무료' : `${entryFee.toLocaleString('ko-KR')}원`;
};

export const formatProgramType = (type: ProgramType) =>
  PROGRAM_TYPE_LABELS[type];

export const formatProgramTag = (tag: ProgramTag) => PROGRAM_TAG_LABELS[tag];

export const getProgramMapSearchUrl = (
  placeName: string,
  address: string,
  detailLocation?: string | null,
) => {
  const keyword = [placeName, address, detailLocation]
    .filter(Boolean)
    .join(' ');

  return keyword
    ? `https://map.naver.com/p/search/${encodeURIComponent(keyword)}`
    : '';
};

export const getProgramSummary = (
  payload: ProgramFeedPayload | ProgramPayload,
) => ({
  dateLabel: formatProgramDateRange(
    payload.eventStartDate,
    payload.eventEndDate,
  ),
  entryFeeLabel: formatProgramFee(payload.entryFee),
  tagLabels: (payload.programTags ?? []).map(formatProgramTag),
});

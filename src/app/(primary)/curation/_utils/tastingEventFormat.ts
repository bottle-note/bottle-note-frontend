const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

export const formatEntryFee = (entryFee: number) => {
  if (entryFee === 0) {
    return '무료';
  }

  return `${entryFee.toLocaleString('ko-KR')}원`;
};

export const formatEventDate = (eventDate: string) => {
  const date = new Date(eventDate);

  if (Number.isNaN(date.getTime())) {
    return eventDate;
  }

  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = WEEKDAY_LABELS[date.getDay()];

  return `${month}월 ${day}일 (${weekday})`;
};

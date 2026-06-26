import type { TastingEventPayload } from '@/api/curation-v2/types';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export function parseTastingEventPayload(payload: TastingEventPayload) {
  const eventDate = new Date(payload.eventDate);
  const eventDateLabel = Number.isNaN(eventDate.getTime())
    ? payload.eventDate
    : `${eventDate.getMonth() + 1}월 ${eventDate.getDate()}일 (${
        WEEKDAYS[eventDate.getDay()]
      })`;
  const [hour, minute] = payload.eventTime.split(':');
  const eventTimeLabel =
    hour && minute ? `${hour}:${minute}` : payload.eventTime;
  const fullAddress = [payload.barAddress, payload.detailAddress]
    .filter(Boolean)
    .join(' ');

  return {
    eventDateLabel,
    eventTimeLabel,
    eventDateTimeLabel: `${eventDateLabel} · ${eventTimeLabel}`,
    fullAddress,
    placeLabel: payload.placeName ?? payload.barAddress,
    capacityLabel: `${payload.capacity.toLocaleString('ko-KR')}명 정원`,
    entryFeeLabel:
      payload.entryFee > 0
        ? `${payload.entryFee.toLocaleString('ko-KR')}원`
        : '무료',
    mapSearchUrl: fullAddress
      ? `https://map.naver.com/p/search/${encodeURIComponent(fullAddress)}`
      : '',
  };
}

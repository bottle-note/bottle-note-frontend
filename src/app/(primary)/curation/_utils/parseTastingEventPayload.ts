import type { TastingEventPayload } from '@/api/curation-v2/types';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const splitDetailAddress = (
  detailAddress: string,
  placeName?: string | null,
) => {
  const normalizedDetailAddress = detailAddress.trim();
  const normalizedPlaceName = placeName?.trim();

  if (!normalizedPlaceName) {
    return { addressDetail: normalizedDetailAddress, placeLabel: '' };
  }

  return {
    addressDetail: normalizedDetailAddress
      .replace(normalizedPlaceName, '')
      .replace(/\s{2,}/g, ' ')
      .trim(),
    placeLabel: normalizedPlaceName,
  };
};

export const getTastingEventCapacityLabel = (capacity: number) =>
  capacity === 0
    ? '모집 인원 미정'
    : `${capacity.toLocaleString('ko-KR')}명 정원`;

export const formatTastingEventFee = (
  entryFee: number,
  isTbc?: boolean | null,
) => {
  if (isTbc) {
    return '가격 미정';
  }

  return entryFee > 0 ? `${entryFee.toLocaleString('ko-KR')}원` : '무료';
};

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
  const { addressDetail, placeLabel } = splitDetailAddress(
    payload.detailAddress,
    payload.placeName,
  );
  const fullAddress = [payload.barAddress, addressDetail]
    .filter(Boolean)
    .join(' ');
  const mapSearchKeyword = [fullAddress, placeLabel].filter(Boolean).join(' ');

  return {
    eventDateLabel,
    eventTimeLabel,
    eventDateTimeLabel: `${eventDateLabel} · ${eventTimeLabel}`,
    fullAddress,
    placeLabel,
    capacityLabel: getTastingEventCapacityLabel(payload.capacity),
    entryFeeLabel: formatTastingEventFee(payload.entryFee, payload.is_tbc),
    mapSearchUrl: mapSearchKeyword
      ? `https://map.naver.com/p/search/${encodeURIComponent(mapSearchKeyword)}`
      : '',
  };
}

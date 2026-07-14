import type { TastingEventPayload } from '@/api/curation-v2/types';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const splitDetailAddress = (
  detailAddress: string,
  placeName?: string | null,
) => {
  const normalizedDetailAddress = detailAddress.trim();
  const normalizedPlaceName = placeName?.trim();

  if (!normalizedDetailAddress) {
    return { addressDetail: '', placeLabel: normalizedPlaceName ?? '' };
  }

  if (normalizedPlaceName) {
    return {
      addressDetail: normalizedDetailAddress
        .replace(normalizedPlaceName, '')
        .replace(/\s{2,}/g, ' ')
        .trim(),
      placeLabel: normalizedPlaceName,
    };
  }

  const detailWithPlace = normalizedDetailAddress.match(
    /^(?<addressDetail>\S*(?:층|호))\s+(?<placeLabel>.+)$/,
  );

  if (detailWithPlace?.groups) {
    return {
      addressDetail: detailWithPlace.groups.addressDetail,
      placeLabel: detailWithPlace.groups.placeLabel,
    };
  }

  return { addressDetail: normalizedDetailAddress, placeLabel: '' };
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
    capacityLabel: `${payload.capacity.toLocaleString('ko-KR')}명 정원`,
    entryFeeLabel:
      payload.entryFee > 0
        ? `${payload.entryFee.toLocaleString('ko-KR')}원`
        : '무료',
    mapSearchUrl: mapSearchKeyword
      ? `https://map.naver.com/p/search/${encodeURIComponent(mapSearchKeyword)}`
      : '',
  };
}

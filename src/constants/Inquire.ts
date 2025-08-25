import { Status } from '@/types/Inquire';

export const INQUIRE_TYPE = {
  service: '서비스',
  business: '비즈니스',
};

export const SERVICE_TYPE_LIST = [
  {
    type: 'WHISKEY',
    name: '위스키 관련 문의',
  },
  {
    type: 'REVIEW',
    name: '리뷰 관련 문의/신고',
  },
  {
    type: 'USER',
    name: '회원 관련 문의/신고',
  },
  {
    type: 'ETC',
    name: '기타 문의',
  },
] as const;

export const BUSINESS_TYPE_LIST = [
  {
    type: 'EVENT',
    name: '이벤트 관련 문의',
  },
  {
    type: 'ADVERTISEMENT',
    name: '광고 관련 문의',
  },
  {
    type: 'ETC',
    name: '기타 문의',
  },
] as const;

export const getStatusText = (status: Status): string => {
  switch (status) {
    case 'WAITING':
      return '답변대기중';
    case 'SUCCESS':
      return '답변완료';
    case 'REJECT':
      return '반려';
    case 'DELETED':
      return '삭제';
    default:
      return '답변대기중';
  }
};

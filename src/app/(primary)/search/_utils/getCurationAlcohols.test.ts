import type {
  CurationAlcohol,
  CurationV2DetailItem,
  CurationV2Payload,
} from '@/api/curation-v2/types';
import { getCurationAlcohols } from './getCurationAlcohols';

const curationAlcohol: CurationAlcohol = {
  alcohol: {
    alcoholId: 101,
    korName: '테스트 위스키',
  },
};

const createCuration = (payload: CurationV2Payload): CurationV2DetailItem => ({
  id: 1,
  name: '테스트 큐레이션',
  description: '',
  coverImageUrl: '',
  imageUrls: [],
  exposureStartDate: '2026-01-01',
  exposureEndDate: '2026-01-31',
  displayOrder: 1,
  createAt: '2026-01-01',
  payload,
});

describe('getCurationAlcohols', () => {
  it('추천 위스키 배열 payload를 그대로 반환한다', () => {
    const payload = [curationAlcohol];

    expect(getCurationAlcohols(createCuration(payload))).toEqual(payload);
  });

  it('시음회 payload의 alcohols를 반환한다', () => {
    const payload = {
      capacity: 20,
      entryFee: 10000,
      eventDate: '2026-01-01',
      eventTime: '19:00',
      guideText: '',
      barAddress: '서울',
      isRecruiting: true,
      detailAddress: '',
      applicationLink: 'https://example.com',
      alcohols: [curationAlcohol],
    };

    expect(getCurationAlcohols(createCuration(payload))).toEqual([
      curationAlcohol,
    ]);
  });

  it('프로그램 payload의 각 회차 whiskies를 한 목록으로 반환한다', () => {
    const secondAlcohol: CurationAlcohol = {
      alcohol: {
        alcoholId: 102,
        korName: '두 번째 위스키',
      },
    };
    const payload = {
      eventStartDate: '2026-01-01',
      eventEndDate: '2026-01-02',
      placeName: '테스트 바',
      address: '서울',
      programs: [
        {
          name: '첫 번째 회차',
          type: 'TASTING' as const,
          programDate: '2026-01-01',
          startTime: '19:00',
          endTime: null,
          venue: null,
          host: null,
          description: '',
          applicationUrl: null,
          whiskies: [curationAlcohol],
        },
        {
          name: '두 번째 회차',
          type: 'TASTING' as const,
          programDate: '2026-01-02',
          startTime: '19:00',
          endTime: null,
          venue: null,
          host: null,
          description: '',
          applicationUrl: null,
          whiskies: [secondAlcohol],
        },
      ],
    };

    expect(getCurationAlcohols(createCuration(payload))).toEqual([
      curationAlcohol,
      secondAlcohol,
    ]);
  });

  it('지원하지 않는 payload는 빈 목록으로 처리한다', () => {
    expect(getCurationAlcohols(createCuration(null))).toEqual([]);
  });
});

import {
  isProgramDetailItem,
  isProgramFeedItem,
  isRecommendedWhiskyDetailItem,
  isWhiskyPairingDetailItem,
  isWhiskyPairingFeedItem,
} from './guards';
import {
  programFeedPayloadSchema,
  programPayloadSchema,
  whiskyPairingPayloadSchema,
} from './schema';
import type { CurationV2DetailItem, CurationV2FeedItem } from './types';

const programFeedPayload = {
  eventStartDate: '2026-07-24',
  eventEndDate: '2026-07-26',
  placeName: '코엑스',
  entryFee: 30000,
  programTags: ['WHISKY', 'COCKTAIL'],
  programs: [
    {
      name: '글렌카담 마스터클래스',
      type: 'MASTER_CLASS',
      programDate: '2026-07-24',
      startTime: '14:00',
    },
  ],
} as const;

const programPayload = {
  ...programFeedPayload,
  address: '서울 강남구 영동대로 513',
  detailLocation: 'C홀',
  organizer: '바앤스피릿쇼 조직위원회',
  sponsor: '보틀노트',
  officialUrl: 'https://www.barshow.co.kr',
  registrationUrl: 'https://event-us.kr/event/123',
  programs: [
    {
      ...programFeedPayload.programs[0],
      endTime: '15:30',
      venue: '마스터클래스룸 A',
      host: '글렌카담 브랜드 앰버서더',
      description: '대표 라인업을 해설과 함께 시음합니다.',
      applicationUrl: 'https://event-us.kr/event/456',
      whiskies: [],
    },
  ],
};

const feedItem: CurationV2FeedItem = {
  id: 1,
  name: '2026 바앤스피릿쇼',
  description: '행사 설명',
  coverImageUrl: 'https://example.com/cover.jpg',
  imageUrls: [],
  exposureStartDate: '2026-07-24',
  exposureEndDate: '2026-07-26',
  displayOrder: 1,
  createAt: '2026-07-01',
  payload: programFeedPayload,
};

describe('PROGRAM payload contract', () => {
  it('feed projection은 x-feed enabled 필드만으로 판별한다', () => {
    expect(programFeedPayloadSchema.safeParse(programFeedPayload).success).toBe(
      true,
    );
    expect(isProgramFeedItem(feedItem)).toBe(true);
  });

  it('detail payload는 행사 정보와 프로그램별 상세 정보를 포함한다', () => {
    const detailItem: CurationV2DetailItem = {
      ...feedItem,
      payload: programPayload,
      spec: {
        id: 1,
        code: 'PROGRAM',
        name: '프로그램',
        container: 'object',
        responseSpec: {},
      },
    };

    expect(programPayloadSchema.safeParse(programPayload).success).toBe(true);
    expect(isProgramDetailItem(detailItem)).toBe(true);
  });
});

describe('WHISKY_PAIRING payload contract', () => {
  const pairingPayload = [
    {
      source: 'BOTTLE_NOTE',
      alcohol: {
        alcoholId: 6415,
        korName: 'TSC 2013 글렌오드 8년',
        selectedTags: ['셰리', '초콜릿'],
      },
      comment: '달콤한 디저트와 잘 어울려요.',
      pairings: [
        {
          itemName: '솔티드 초콜릿',
          pairingNote: '짠맛이 위스키의 단맛을 살려줘요.',
          itemImageUrl: 'https://example.com/chocolate.jpg',
        },
      ],
    },
  ];

  const pairingFeedItem: CurationV2FeedItem = {
    ...feedItem,
    id: 18,
    name: '위스키와 잘 어울리는 디저트',
    payload: pairingPayload,
  };

  it('페어링 음식 목록을 포함한 payload를 판별한다', () => {
    expect(whiskyPairingPayloadSchema.safeParse(pairingPayload).success).toBe(
      true,
    );
    expect(isWhiskyPairingFeedItem(pairingFeedItem)).toBe(true);
  });

  it('상세 응답은 WHISKY_PAIRING spec code까지 확인한다', () => {
    const detailItem: CurationV2DetailItem = {
      ...pairingFeedItem,
      spec: {
        id: 2,
        code: 'WHISKY_PAIRING',
        name: '위스키 페어링',
        container: 'array',
        responseSpec: {},
      },
    };

    expect(isWhiskyPairingDetailItem(detailItem)).toBe(true);
    expect(isRecommendedWhiskyDetailItem(detailItem)).toBe(false);
  });
});

describe('RECOMMENDED_WHISKY detail contract', () => {
  it('상세 응답은 RECOMMENDED_WHISKY spec code까지 확인한다', () => {
    const detailItem: CurationV2DetailItem = {
      ...feedItem,
      payload: [
        {
          source: 'BOTTLE_NOTE',
          alcohol: {
            alcoholId: 6415,
            korName: 'TSC 2013 글렌오드 8년',
          },
        },
      ],
      spec: {
        id: 3,
        code: 'RECOMMENDED_WHISKY',
        name: '추천 위스키',
        container: 'array',
        responseSpec: {},
      },
    };

    expect(isRecommendedWhiskyDetailItem(detailItem)).toBe(true);
    expect(isWhiskyPairingDetailItem(detailItem)).toBe(false);
  });
});

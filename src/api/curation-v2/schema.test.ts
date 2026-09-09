import {
  programFeedPayloadSchema,
  programPayloadSchema,
  recommendedWhiskyPayloadSchema,
  tastingEventPayloadSchema,
  whiskyPairingPayloadSchema,
} from './schema';

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

describe('WHISKY_TASTING_EVENT payload contract', () => {
  const tastingEventPayload = {
    capacity: 20,
    entryFee: 0,
    eventDate: '2026-08-20',
    eventTime: '19:00',
    guideText: '행사 안내',
    barAddress: '서울 송파구',
    isRecruiting: true,
    detailAddress: '2층',
    applicationLink: 'https://example.com',
  };

  it.each([true, false, null, undefined])(
    '가격 미정 상태 %s를 허용한다',
    (isTbc) => {
      expect(
        tastingEventPayloadSchema.safeParse({
          ...tastingEventPayload,
          is_tbc: isTbc,
        }).success,
      ).toBe(true);
    },
  );
});

describe('PROGRAM payload contract', () => {
  it('feed projection은 x-feed enabled 필드만으로 판별한다', () => {
    expect(programFeedPayloadSchema.safeParse(programFeedPayload).success).toBe(
      true,
    );
  });

  it.each([
    {
      name: '일정이 미정인 프로그램',
      payload: {
        eventStartDate: '2026-12-10',
        eventEndDate: '2027-01-13',
        placeName: '우리집',
        programs: [{ name: '산들쇼', type: 'TASTING' }],
      },
    },
    {
      name: '라인업을 아직 등록하지 않은 행사',
      payload: {
        eventStartDate: '2026-09-16',
        eventEndDate: '2026-09-16',
        placeName: '코엑스',
      },
    },
  ])('$name도 feed payload로 허용한다', ({ payload }) => {
    expect(programFeedPayloadSchema.safeParse(payload).success).toBe(true);
  });

  it('detail payload는 행사 정보와 프로그램별 상세 정보를 포함한다', () => {
    expect(programPayloadSchema.safeParse(programPayload).success).toBe(true);
  });

  it('라인업이 없는 프로그램 상세 payload도 허용한다', () => {
    expect(
      programPayloadSchema.safeParse({
        eventStartDate: '2026-09-16',
        eventEndDate: '2026-09-16',
        placeName: '코엑스',
        address: '서울 강남구 영동대로 513',
      }).success,
    ).toBe(true);
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

  it('페어링 음식 목록을 포함한 payload를 허용한다', () => {
    expect(whiskyPairingPayloadSchema.safeParse(pairingPayload).success).toBe(
      true,
    );
  });
});

describe('RECOMMENDED_WHISKY detail contract', () => {
  it('추천 위스키 배열 payload를 허용한다', () => {
    expect(
      recommendedWhiskyPayloadSchema.safeParse([
        {
          source: 'BOTTLE_NOTE',
          alcohol: {
            alcoholId: 6415,
            korName: 'TSC 2013 글렌오드 8년',
          },
        },
      ]).success,
    ).toBe(true);
  });
});

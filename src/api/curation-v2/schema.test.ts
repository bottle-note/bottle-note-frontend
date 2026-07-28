import { isProgramDetailItem, isProgramFeedItem } from './guards';
import { programFeedPayloadSchema, programPayloadSchema } from './schema';
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

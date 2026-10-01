import type { AlcoholDetailsResponse, AlcoholInfo } from '@/api/alcohol/types';
import type { CurationV2DetailItem } from '@/api/curation-v2/types';
import type { ReviewDetailsResponse } from '@/api/review/types';
import { generateAlcoholSchema } from '@/utils/seo/generateAlcoholSchema';
import {
  buildAlcoholMetadata,
  buildAlcoholReviewsMetadata,
} from './alcoholMetadata';
import { buildCurationMetadata } from './curationMetadata';
import { buildReviewMetadata } from './reviewMetadata';
import { buildUserMetadata } from './userMetadata';
import { sectionTitle } from './site';
import { DESCRIPTION_MAX_LENGTH } from './text';

// 2026-10-01 GET /api/v1/alcohols/482 실제 응답 기준
function alcohol(overrides: Partial<AlcoholInfo> = {}): AlcoholInfo {
  return {
    alcoholId: 482,
    alcoholUrlImg: 'https://cdn.example.com/springbank-10.jpg',
    korName: '스프링뱅크 10년',
    engName: 'Springbank 10yo',
    korCategory: '싱글 몰트',
    engCategory: 'Single Malt',
    korRegion: '스코틀랜드/캠벨타운',
    engRegion: 'Scotland/Campbeltown',
    cask: 'Ex-Bourbon Casks (60%) & Ex-Sherry Casks (40%)',
    abv: '46%',
    korDistillery: '스프링뱅크',
    engDistillery: 'Springbank',
    description:
      '스프링뱅크 10은 캠벨타운 특유의 개성을 가장 균형감 있게 보여주는 싱글몰트입니다. \n밝은 과일감과 몰티한 결, 은은한 피트, 짭짤한 해풍 같은 뉘앙스가 자연스럽게 겹쳐집니다.',
    rating: 3.8,
    totalRatingsCount: 16,
    myRating: 0,
    myAvgRating: 0,
    isPicked: false,
    reviewCount: 14,
    pickCount: 3,
    alcoholsTastingTags: ['보리', '씨리얼', '시나몬', '구스베리', '청포도'],
    ...overrides,
  };
}

function alcoholDetail(info: AlcoholInfo): AlcoholDetailsResponse {
  return {
    alcohols: info,
    friendsInfo: { followerCount: 0, friends: [] },
    reviewInfo: { reviewList: [] },
  };
}

function review(
  overrides: Partial<ReviewDetailsResponse['reviewInfo']> = {},
): ReviewDetailsResponse {
  return {
    alcoholInfo: {
      alcoholId: 482,
      korName: '스프링뱅크 10년',
      engName: 'Springbank 10yo',
      korCategory: '싱글 몰트',
      engCategory: 'Single Malt',
      imageUrl: 'https://cdn.example.com/springbank-10.jpg',
      isPicked: false,
    } as ReviewDetailsResponse['alcoholInfo'],
    reviewInfo: {
      reviewId: 9001,
      reviewContent:
        '피트향과 은은한 과일향이 조화롭고\n10년 숙성에 볼수없는 부드러운 목넘김',
      rating: 5,
      status: 'PUBLIC',
      createAt: '2026-09-19T17:41:48',
      userInfo: { userId: 7, nickName: '따뜻한글렌리벳307' },
      ...overrides,
    } as ReviewDetailsResponse['reviewInfo'],
    reviewImageList: [{ order: 1, viewUrl: 'https://cdn.example.com/r1.jpg' }],
  };
}

describe('보틀 상세 메타데이터', () => {
  it('보틀 고유명·스펙·상위 태그 3개·평점·소개 문구로 description을 만든다', () => {
    const metadata = buildAlcoholMetadata('482', {
      status: 'ok',
      data: alcoholDetail(alcohol()),
    });

    expect(metadata.title).toEqual(sectionTitle('스프링뱅크 10년 맛·향·후기'));
    expect(metadata.openGraph?.title).toBe('스프링뱅크 10년 맛·향·후기');
    expect(metadata.description).toMatch(
      /^스프링뱅크 10년\(Springbank 10yo\) · 싱글 몰트 · 스코틀랜드\/캠벨타운 · 46%\. 보리·씨리얼·시나몬 노트\. 평균 별점 3\.8점\(16명\)\. 스프링뱅크 10은/,
    );
    expect(metadata.description).not.toContain('구스베리');
    expect(metadata.description!.length).toBeLessThanOrEqual(
      DESCRIPTION_MAX_LENGTH,
    );
    expect(metadata.alternates?.canonical).toBe('/alcohols/482');
    expect(metadata.openGraph?.url).toBe('/alcohols/482');
  });

  it('평가가 없으면 평점 문구를 넣지 않는다', () => {
    const metadata = buildAlcoholMetadata('482', {
      status: 'ok',
      data: alcoholDetail(alcohol({ rating: 0, totalRatingsCount: 0 })),
    });

    expect(metadata.description).not.toMatch(/별점|N\/A/);
  });

  it('같은 증류소 보틀도 서로 다른 description을 갖는다', () => {
    const tenYear = buildAlcoholMetadata('482', {
      status: 'ok',
      data: alcoholDetail(alcohol()),
    });
    const fifteenYear = buildAlcoholMetadata('483', {
      status: 'ok',
      data: alcoholDetail(
        alcohol({
          alcoholId: 483,
          korName: '스프링뱅크 15년',
          engName: 'Springbank 15yo',
          description: '',
          alcoholsTastingTags: ['셰리', '건포도', '다크 초콜릿'],
        }),
      ),
    });

    expect(tenYear.description).not.toBe(fifteenYear.description);
    expect(fifteenYear.description).toContain(
      '셰리·건포도·다크 초콜릿 노트. 평균 별점',
    );
    expect(fifteenYear.description).toMatch(
      /테이스팅 노트와 리뷰를 확인하세요\.$/,
    );
  });

  it('증류소 자리표시 값(-, ETC)은 키워드에 넣지 않는다', () => {
    const metadata = buildAlcoholMetadata('8186', {
      status: 'ok',
      data: alcoholDetail(
        alcohol({ korDistillery: '-', engDistillery: 'ETC' }),
      ),
    });

    expect(metadata.keywords).not.toContain('-');
    expect(metadata.keywords).not.toContain('ETC');
  });

  it('없는 보틀은 색인하지 않고, 일시 오류는 색인을 막지 않는다', () => {
    expect(buildAlcoholMetadata('1', { status: 'not-found' }).robots).toEqual({
      index: false,
      follow: false,
    });

    const onError = buildAlcoholMetadata('1', { status: 'error' });
    expect(onError.robots).toBeUndefined();
    expect(onError.alternates?.canonical).toBe('/alcohols/1');
  });

  it('리뷰 목록 페이지는 상세와 다른 canonical과 리뷰 수 제목을 갖는다', () => {
    const metadata = buildAlcoholReviewsMetadata('482', {
      status: 'ok',
      data: alcoholDetail(alcohol()),
    });

    expect(metadata.title).toBe('스프링뱅크 10년 리뷰 14개');
    expect(metadata.alternates?.canonical).toBe('/alcohols/482/reviews');
    expect(metadata.description).toContain(
      '보틀노트 사용자들이 남긴 스프링뱅크 10년(Springbank 10yo) 리뷰 14개.',
    );
  });
});

describe('보틀 JSON-LD', () => {
  it('평가가 있으면 평균 별점을 넣는다', () => {
    const schema = generateAlcoholSchema(alcohol());

    expect(schema.url).toBe('https://bottle-note.com/alcohols/482');
    expect(schema.aggregateRating).toMatchObject({
      ratingValue: '3.8',
      ratingCount: 16,
    });
  });

  it('평가가 없으면 aggregateRating을 넣지 않는다', () => {
    const schema = generateAlcoholSchema(
      alcohol({ rating: 0, totalRatingsCount: 0 }),
    );

    expect(schema.aggregateRating).toBeUndefined();
  });

  it('캐시된 보틀 조회에서 만들므로 개별 리뷰 본문을 넣지 않는다', () => {
    expect(generateAlcoholSchema(alcohol()).review).toBeUndefined();
  });
});

describe('리뷰 상세 메타데이터', () => {
  it('작성자·보틀명·별점과 리뷰 본문 앞부분으로 description을 만든다', () => {
    const metadata = buildReviewMetadata('9001', {
      status: 'ok',
      data: review(),
    });

    expect(metadata.title).toBe(
      '스프링뱅크 10년 후기 - 따뜻한글렌리벳307님의 테이스팅 노트',
    );
    expect(metadata.description).toBe(
      '따뜻한글렌리벳307님의 스프링뱅크 10년 리뷰(별점 5점). 피트향과 은은한 과일향이 조화롭고 10년 숙성에 볼수없는 부드러운 목넘김',
    );
    expect(metadata.openGraph?.images).toEqual([
      { url: 'https://cdn.example.com/r1.jpg' },
    ]);
  });

  it('본문이 비어 있어도 description을 채운다', () => {
    const metadata = buildReviewMetadata('9001', {
      status: 'ok',
      data: review({ reviewContent: '', rating: 0 }),
    });

    expect(metadata.description).toBe(
      '따뜻한글렌리벳307님의 스프링뱅크 10년 리뷰. 테이스팅 노트를 확인하세요.',
    );
  });

  it('비공개 리뷰는 본문을 메타에 넣지 않고 색인하지 않는다', () => {
    const metadata = buildReviewMetadata('9001', {
      status: 'ok',
      data: review({ status: 'PRIVATE' }),
    });

    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(JSON.stringify(metadata)).not.toContain('피트향');
  });
});

describe('큐레이션 상세 메타데이터', () => {
  it('큐레이션 이름·유형과 소개 문구로 메타를 만든다', () => {
    const metadata = buildCurationMetadata('16', {
      status: 'ok',
      data: {
        id: 16,
        name: '2026 서울국제주류&와인박람회 마곡',
        description: `코엑스 마곡에서 열리는 박람회입니다.\n\n${'위스키 '.repeat(60)}`,
        coverImageUrl: 'https://cdn.example.com/cover.jpg',
        imageUrls: [],
        spec: {
          id: 4,
          code: 'PROGRAM',
          name: '프로그램',
          container: 'object',
          responseSpec: {},
        },
      } as unknown as CurationV2DetailItem,
    });

    expect(metadata.title).toBe('2026 서울국제주류&와인박람회 마곡 - 프로그램');
    expect(metadata.description).toMatch(
      /^코엑스 마곡에서 열리는 박람회입니다\. 위스키/,
    );
    expect(metadata.description!.length).toBeLessThanOrEqual(
      DESCRIPTION_MAX_LENGTH,
    );
    expect(metadata.alternates?.canonical).toBe('/curation/16');
  });
});

describe('사용자 페이지 메타데이터', () => {
  it('공유 미리보기용 제목을 만들고 색인하지 않는다', () => {
    const metadata = buildUserMetadata({
      status: 'ok',
      data: {
        userId: 7,
        nickName: '위스키러버',
        imageUrl: '',
        reviewCount: 3,
        ratingCount: 10,
        pickCount: 2,
        followerCount: 0,
        followingCount: 0,
        isFollow: false,
        isMyPage: false,
      },
    });

    expect(metadata.title).toEqual(sectionTitle('위스키러버님의 위스키 기록'));
    expect(metadata.description).toContain('리뷰 3개 · 별점 10개 · 찜 2개');
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});

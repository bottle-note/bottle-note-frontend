import {
  buildTastingAxisSuggestions,
  createDefaultTastingProfile,
  isDefaultTastingProfile,
  restoreSavedReviewContent,
  toSubmitTastingProfile,
} from './tastingProfile';

const customProfile = {
  version: 1,
  maxScore: 10,
  axes: [
    { code: null, name: '스모키', description: '연기 · 이탄 · 숯', score: 7 },
    { code: null, name: '바닐라', description: '바닐라빈 · 크림', score: 4 },
    { code: null, name: '바디감', description: '가벼움 ↔ 묵직함', score: 8 },
  ],
};

const form = {
  review: '시음 기록',
  status: 'PUBLIC',
  price_type: null,
  price: null,
};

describe('테이스팅 프로필 변환', () => {
  it('저장된 프로필은 항목 구성과 점수를 바꾸지 않고 전송한다', () => {
    expect(toSubmitTastingProfile(customProfile)).toBe(customProfile);
  });

  it('모든 점수가 0이면 기록이 없는 것으로 전송한다', () => {
    expect(toSubmitTastingProfile(createDefaultTastingProfile())).toBeNull();
  });

  it('기본 6항목·5점 구성만 기본 프로필로 판별한다', () => {
    expect(isDefaultTastingProfile(createDefaultTastingProfile())).toBe(true);
    expect(isDefaultTastingProfile(customProfile)).toBe(false);
  });

  it('여섯 점수로 임시저장된 예전 작성 내용을 기본 프로필로 복원한다', () => {
    const restored = restoreSavedReviewContent({
      ...form,
      tastingNote: {
        smoky: 3,
        fruity: 0,
        floral: 0,
        sweet: 4,
        spicy: 0,
        body: 5,
      },
    });

    expect(restored).not.toHaveProperty('tastingNote');
    expect(restored.tastingProfile?.axes.map((axis) => axis.score)).toEqual([
      3, 0, 0, 4, 0, 5,
    ]);
  });

  it('새 형식으로 임시저장된 프로필은 그대로 불러온다', () => {
    expect(
      restoreSavedReviewContent({ ...form, tastingProfile: customProfile })
        .tastingProfile,
    ).toBe(customProfile);
  });
});

describe('테이스팅 항목 추천', () => {
  it('리뷰 태그를 먼저 두고 기존 항목·긴 이름·중복을 제외한다', () => {
    expect(
      buildTastingAxisSuggestions(
        [
          ['건자두', '셰리', ' 피트 '],
          ['셰리', '과일', '설탕에 볶은 견과류는', '오크'],
        ],
        ['과일', '스모키'],
      ),
    ).toEqual(['건자두', '셰리', '피트', '오크']);
  });

  it('최대 개수까지만 추천한다', () => {
    const tags = Array.from({ length: 12 }, (_, i) => `태그${i}`);
    expect(buildTastingAxisSuggestions([tags], [])).toHaveLength(8);
  });
});

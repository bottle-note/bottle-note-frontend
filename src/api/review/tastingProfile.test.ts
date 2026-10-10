import {
  fromReviewTastingProfile,
  toReviewTastingProfile,
} from './tastingProfile';

describe('저장된 테이스팅 그래프 복원', () => {
  it('API 응답을 수정 가능한 여섯 축 점수로 복원한다', () => {
    const note = {
      smoky: 3,
      fruity: 2,
      floral: 0,
      sweet: 4,
      spicy: 1,
      body: 5,
    };
    expect(fromReviewTastingProfile(toReviewTastingProfile(note))).toEqual(
      note,
    );
  });

  it('프론트에서 편집할 수 없는 축 구성을 임의로 변환하지 않는다', () => {
    expect(
      fromReviewTastingProfile({
        version: 1,
        maxScore: 10,
        axes: [{ code: 'OTHER', name: '다른 축', description: null, score: 7 }],
      }),
    ).toBeNull();
  });
});

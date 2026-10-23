/** 현재 질문지의 화면 데이터. API 계약이 생기면 이 입력값을 서버 응답으로 교체한다. */
export type QuestionOption = { title: string; description?: string };

export type BartenderQuestionnaire = {
  levels: QuestionOption[];
  kinds: QuestionOption[];
  axes: QuestionOption[];
  americanAxes: QuestionOption[];
  abvs: QuestionOption[];
  prices: { glass: QuestionOption[]; bottle: QuestionOption[] };
};

export const localQuestionnaire: BartenderQuestionnaire = {
  levels: [
    {
      title: '위스키 잘 몰라요',
      description: '무난하고 평이 좋은 쪽으로 골라 드려요',
    },
    {
      title: '몇 번 마셔봤어요',
      description: '익숙한 것과 새로운 것을 섞어 드려요',
    },
    {
      title: '자주 마시는 편이에요',
      description: '덜 알려진 것, 도수 있는 것도 넣어 드려요',
    },
  ],
  kinds: [
    {
      title: '싱글 몰트',
      description: '한 증류소의 보리 원액 · 글렌피딕, 맥캘란',
    },
    { title: '블렌디드', description: '여러 원액을 섞은 · 조니워커, 발렌타인' },
    {
      title: '버번',
      description: '새 오크통의 단맛 · 메이커스 마크, 버팔로 트레이스',
    },
    {
      title: '라이',
      description: '호밀의 알싸함 · 불렛 라이, 우드포드 리저브',
    },
    { title: '상관없어요', description: '종류는 따지지 않고 고를게요' },
  ],
  axes: [
    { title: '피트·스모키', description: '모닥불과 바닷바람 같은 향' },
    { title: '셰리·건과일', description: '건포도와 초콜릿 같은 깊은 단맛' },
    { title: '바닐라·꿀', description: '버번 통에서 오는 바닐라와 꿀의 단맛' },
    { title: '과일·꽃', description: '사과와 꽃 같은 산뜻한 향' },
    { title: '스파이시', description: '후추와 시나몬 같은 향신료' },
    { title: '상관없어요', description: '나머지는 바텐더에게 맡길게요' },
  ],
  americanAxes: [
    { title: '바닐라·캐러멜', description: '새 오크통에서 오는 바닐라 단맛' },
    { title: '스파이시·호밀', description: '호밀에서 오는 후추 같은 알싸함' },
    { title: '체리·과일', description: '체리와 오렌지 같은 과일 단맛' },
    { title: '진한 오크·가죽', description: '오래 숙성한 묵직한 오크 향' },
    { title: '부드러운·밀', description: '호밀 대신 밀을 넣은 순한 맛' },
    { title: '상관없어요', description: '나머지는 바텐더에게 맡길게요' },
  ],
  abvs: [
    { title: '43% 이하 · 편하게' },
    { title: '44~46% · 적당히' },
    { title: '47% 이상 · 세게' },
    { title: '상관없어요' },
  ],
  prices: {
    glass: [
      { title: '1.5만 원 이하' },
      { title: '1.5~2.5만 원' },
      { title: '2.5~4만 원' },
      { title: '4만 원 이상' },
      { title: '상관없어요' },
    ],
    bottle: [
      { title: '5만 원 이하' },
      { title: '5~10만 원' },
      { title: '10~20만 원' },
      { title: '20만 원 이상' },
      { title: '상관없어요' },
    ],
  },
};

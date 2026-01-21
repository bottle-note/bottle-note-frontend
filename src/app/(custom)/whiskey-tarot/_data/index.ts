import { TarotCard, WhiskyRecommend, FlavorTag } from '../_types';

export const TAROT_CARDS: TarotCard[] = [
  {
    id: 0,
    name: 'The Fool',
    nameKo: '바보',
    flavorTag: 'Fresh',
    readingText:
      '계산기는 잠시 넣어두세요. 지금은 앞뒤 재지 말고 무작정 저질러야 할 때입니다. 가벼운 마음으로 내디딘 그 한 걸음이 생각지 못한 행운을 불러올 거예요.',
    history:
      "타로의 0번 카드로, '아무것도 모르는 상태'이자 '모든 가능성'을 뜻합니다. 벼랑 끝에 서 있으면서도 하늘을 보는 모습은 무모함이 아닌 순수한 믿음을 상징하죠.",
    image: '/images/tarot/0-fool.png',
    color: '#2d5a27',
  },
  {
    id: 1,
    name: 'The Magician',
    nameKo: '마법사',
    flavorTag: 'Strong',
    readingText:
      '판을 뒤집을 힘은 이미 당신 손안에 있습니다. 목표를 현실로 만들 도구는 모두 갖춰졌으니, 이제 필요한 건 스스로를 믿고 실행하는 행동력뿐입니다.',
    history:
      '연금술사와 창조주를 상징합니다. 책상 위의 4가지 상징물(지팡이, 잔, 검, 동전)은 세상을 구성하는 4원소를 뜻하며, 무(無)에서 유(有)를 창조하는 능력을 의미합니다.',
    image: '/images/tarot/1-magician.png',
    color: '#4a2c7a',
  },
  {
    id: 2,
    name: 'The Empress',
    nameKo: '여황제',
    flavorTag: 'Sweet',
    readingText:
      '머리를 비우고 오감이 이끄는 즐거움에 푹 빠져보세요. 오늘은 생산성보다 풍요로움이 중요한 날입니다. 당신은 대접받을 자격이 충분합니다.',
    history:
      '대지의 어머니이자 풍요의 여신을 상징합니다. 자연의 생명력과 임신, 예술적 결실을 의미하며, 고대 로마의 비너스 신화와도 깊은 연관이 있는 카드입니다.',
    image: '/images/tarot/2-empress.png',
    color: '#7a4a2c',
  },
  {
    id: 3,
    name: 'The Emperor',
    nameKo: '황제',
    flavorTag: 'Strong',
    readingText:
      '흔들리지 않는 단단함으로 상황을 주도하세요. 지금 필요한 건 감정이 아닌, 냉철한 판단력과 질서입니다. 당신의 리더십이 문제를 해결해 줄 것입니다.',
    history:
      '가부장적인 권위와 체계적인 질서를 상징합니다. 여황제가 감성적인 풍요라면, 황제는 이성적인 통제와 보호를 뜻하며 엄격한 책임감을 강조합니다.',
    image: '/images/tarot/3-emperor.png',
    color: '#8b0000',
  },
  {
    id: 4,
    name: 'The Lovers',
    nameKo: '연인',
    flavorTag: 'Sweet',
    readingText:
      '당신의 마음을 울리는 무언가와 마주하게 됩니다. 이성적인 계산보다는 가슴 뛰는 쪽을 선택하세요. 그 강렬한 끌림은 결코 거짓말을 하지 않습니다.',
    history:
      '에덴동산의 아담과 하와를 모티브로 합니다. 단순히 연애 운을 넘어, 인생에서 중요한 가치관의 선택이나 두 가지 사이의 완벽한 조화를 상징합니다.',
    image: '/images/tarot/4-lovers.png',
    color: '#d4508a',
  },
  {
    id: 5,
    name: 'The Hermit',
    nameKo: '은둔자',
    flavorTag: 'Peat',
    readingText:
      '시끄러운 세상과 잠시 거리를 두고 나만의 동굴로 들어갈 시간입니다. 이건 외로움이 아니라, 더 깊어지기 위해 내면의 목소리를 듣는 귀한 시간입니다.',
    history:
      "지혜를 찾기 위해 세상을 등진 구도자의 모습입니다. 그가 든 등불은 '진리의 빛'을 뜻하며, 정답을 밖이 아닌 자신의 내면에서 찾으라는 깊은 철학적 의미를 담고 있습니다.",
    image: '/images/tarot/5-hermit.png',
    color: '#2c3e50',
  },
  {
    id: 6,
    name: 'Death',
    nameKo: '죽음',
    flavorTag: 'Strong',
    readingText:
      '끝이 아니라 완전히 새로운 시작입니다. 낡은 껍질을 깨는 과정은 고통스럽지만, 그 끝엔 더 강인하게 다시 태어난 당신이 기다리고 있습니다.',
    history:
      "중세 '죽음의 무도' 회화에서 유래했습니다. 불운한 예언이 아니라 '낡은 것의 종말'과 '새로운 탄생'을 위한 불가항력적인 변화의 수레바퀴를 의미합니다.",
    image: '/images/tarot/6-death.png',
    color: '#1a1a1a',
  },
  {
    id: 7,
    name: 'The Devil',
    nameKo: '악마',
    flavorTag: 'Peat',
    readingText:
      '위험한 줄 알면서도 끌리는 치명적인 유혹에 빠져있군요. 억누르기보다 차라리 그 욕망에 솔직해져 보는 건 어떨까요? 때론 탐닉도 경험입니다.',
    history:
      "그리스 신화의 반인반수 '판(Pan)'을 형상화했습니다. 우리를 속박하는 집착, 중독, 물질적 욕망을 상징하며, 사실 그 쇠사슬은 스스로 풀 수 있을 만큼 느슨하다는 역설을 담고 있습니다.",
    image: '/images/tarot/7-devil.png',
    color: '#4a0e0e',
  },
  {
    id: 8,
    name: 'The Moon',
    nameKo: '달',
    flavorTag: 'Peat',
    readingText:
      '안개 속을 걷는 듯 불안해도 당신의 직관을 믿으세요. 눈에 보이는 것이 다가 아닙니다. 논리보다 당신의 예민해진 예감이 정답을 알려줄 것입니다.',
    history:
      '무의식과 미지의 세계를 뜻합니다. 달빛 아래에서는 사물이 왜곡되어 보이듯, 혼란과 불안을 상징하지만 동시에 예술적 영감과 무의식의 깊은 통찰을 의미하기도 합니다.',
    image: '/images/tarot/8-moon.png',
    color: '#1a1a2e',
  },
  {
    id: 9,
    name: 'The Sun',
    nameKo: '태양',
    flavorTag: 'Fresh',
    readingText:
      '구름 한 점 없는 하늘처럼 앞날이 쾌청합니다. 타로에서 가장 긍정적인 에너지가 당신을 비추고 있으니, 어떤 걱정도 햇살 아래 눈 녹듯 사라질 거예요.',
    history:
      "성공, 승리, 생명력을 상징하는 가장 강력한 긍정의 카드입니다. 카드 속 어린아이는 '순수함'을 뜻하며, 가식 없는 진실이 승리한다는 낙천적인 세계관을 보여줍니다.",
    image: '/images/tarot/9-sun.png',
    color: '#c9a227',
  },
];

// 5개 위스키 카테고리
export const WHISKY_BY_CATEGORY: Record<FlavorTag, WhiskyRecommend> = {
  Fresh: {
    category: 'Fresh',
    name: 'AnCnoc 12',
    nameKo: '아녹 12년',
    description:
      "하이랜드의 '녹두(Knockdhu)' 증류소에서 만든 숨겨진 물건이에요. 갓 베어낸 풀내음이랑 레몬 향이 확 퍼져서 정말 산뜻해요. 마니아들 사이에선 '모닝 위스키로 이만한 게 없다'고 할 정도로 기분 전환에 딱입니다.",
    emoji: '🍋',
    whiskyCategory: 'all',
    whiskyId: 444,
  },
  Sweet: {
    category: 'Sweet',
    name: 'GlenAllachie 15',
    nameKo: '글렌알라키 15년',
    description:
      "위스키계의 살아있는 전설, '빌리 워커' 할아버지가 작정하고 만든 역작이에요. 색소 한 방울 안 넣었는데도 쉐리 오크통 숙성만으로 진한 마호가니 빛이 나요. 입안에 넣으면 꾸덕한 초콜릿이랑 건포도 맛이 꽉 차는, 솔직히 이 정도 풍요로움을 주는 술은 찾기 힘들죠.",
    emoji: '🍯',
    whiskyCategory: 'all',
    whiskyId: 276,
  },
  Peat: {
    category: 'Peat',
    name: 'Ledaig 10',
    nameKo: '레칙 10년',
    description:
      '보통 피트 위스키 하면 아일라 섬을 찾는데, 얘는 뮬(Mull) 섬의 토버모리 증류소에서 온 녀석이라 결이 좀 달라요. 소독약 냄새보다는 비에 젖은 흙이나 오래된 가죽 같은 거칠고 투박한 냄새가 매력이죠. 혼자 조용히 생각 정리하고 싶을 때 바텐더들이 몰래 꺼내주는 술입니다.',
    emoji: '🔥',
    whiskyCategory: 'all',
    whiskyId: 5867,
  },
  Strong: {
    category: 'Strong',
    name: 'Ardbeg Uigeadail',
    nameKo: '아드벡 우거다일',
    description:
      "이름부터가 '어둡고 신비한 곳'이라는 뜻이에요. 도수가 54.2도나 되는데, 마셔보면 그냥 독하기만 한 게 아닙니다. 아드벡 특유의 매캐한 연기 냄새랑 쉐리 캐스크의 끈적한 단맛이 입안에서 '꽝!' 하고 부딪히는 느낌이거든요. 자극이 필요하거나 마음을 다잡고 싶은 날엔 무조건 이거예요.",
    emoji: '💪',
    whiskyCategory: 'all',
    whiskyId: 466,
  },
  Balance: {
    category: 'Balance',
    name: 'Highland Park 12',
    nameKo: '하이랜드 파크 12년',
    description:
      "스코틀랜드 가장 북쪽, 바람 거친 오크니 섬에서 온 '바이킹의 후예'입니다. 재밌는 게, 여기 피트(Peat)에는 꽃이 섞여 있어서 스모키한데도 은근히 꿀처럼 달콤한 꽃향기가 나요. 너무 튀지도 않고 심심하지도 않고... 바텐더들이 '실패 없는 육각형 위스키' 찾을 때 제일 먼저 권해주는 친구입니다.",
    emoji: '⚖️',
    whiskyCategory: 'all',
    whiskyId: 179,
  },
};

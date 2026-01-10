import { TarotCard, WhiskyRecommend, FlavorTag } from '../_types';

export const TAROT_CARDS: TarotCard[] = [
  {
    id: 0,
    name: 'The Fool',
    nameKo: '바보',
    flavorTag: 'Fresh',
    readingText:
      "지금은 계산할 때가 아니라, 무작정 저질러야 할 때입니다. Biddy Tarot에서는 이 카드를 '순수한 믿음의 도약'이라고 설명합니다. 앞뒤 재지 말고 가벼운 마음으로 시작해보세요. 그 무모함이 오히려 행운을 불러올 것입니다.",
    image: '/images/tarot/0-fool.png',
    color: '#2d5a27',
  },
  {
    id: 1,
    name: 'The Magician',
    nameKo: '마법사',
    flavorTag: 'Strong',
    readingText:
      "판을 뒤집을 힘이 이미 당신 손안에 있습니다. Labyrinthos의 해석에 따르면, 당신은 목표를 현실로 만들 '모든 도구'를 갖추고 있습니다. 지금 필요한 건 딱 하나, 당신의 능력을 믿고 주문을 외우는 행동력뿐입니다.",
    image: '/images/tarot/1-magician.png',
    color: '#4a2c7a',
  },
  {
    id: 2,
    name: 'The Empress',
    nameKo: '여황제',
    flavorTag: 'Sweet',
    readingText:
      "머리를 비우고, 오감이 이끄는 즐거움에 빠져보세요. 타로 가이드(The Tarot Guide)에서는 이 카드를 '감각적인 풍요'의 상징으로 봅니다. 오늘만큼은 나를 위해 가장 맛있는 술과 편안한 시간을 선물하세요. 당신은 대접받아 마땅합니다.",
    image: '/images/tarot/2-empress.png',
    color: '#7a4a2c',
  },
  {
    id: 3,
    name: 'The Emperor',
    nameKo: '황제',
    flavorTag: 'Strong',
    readingText:
      "흔들리지 않는 단단함으로 상황을 장악하세요. Keen의 해석처럼, 이 카드는 혼란을 잠재우는 '질서와 통제'를 의미합니다. 감정에 휩쓸리지 않는 당신의 냉철한 판단력이 복잡한 문제들을 깔끔하게 해결해 줄 것입니다.",
    image: '/images/tarot/3-emperor.png',
    color: '#8b0000',
  },
  {
    id: 4,
    name: 'The Lovers',
    nameKo: '연인',
    flavorTag: 'Sweet',
    readingText:
      "당신의 영혼을 울리는 무언가를 만나게 됩니다. Biddy Tarot은 이를 단순한 연애가 아닌 '가치관의 완벽한 결합'이라고 합니다. 사람이든 일이든, 당신의 가슴을 뛰게 하는 선택을 하세요. 그 끌림은 진짜입니다.",
    image: '/images/tarot/4-lovers.png',
    color: '#d4508a',
  },
  {
    id: 5,
    name: 'The Hermit',
    nameKo: '은둔자',
    flavorTag: 'Peat',
    readingText:
      "시끄러운 세상과 잠시 단절하고, 나만의 동굴로 들어가세요. 현대 타로 해석에서는 이를 '내면의 목소리를 듣는 시간'이라 정의합니다. 외로움이 아닙니다. 더 높이 도약하기 위해 잠시 멈춰 서서 스스로를 돌아보는 귀한 고독입니다.",
    image: '/images/tarot/5-hermit.png',
    color: '#2c3e50',
  },
  {
    id: 6,
    name: 'Death',
    nameKo: '죽음',
    flavorTag: 'Strong',
    readingText:
      "끝이 아니라, 완전히 새로운 모습으로 다시 태어날 시간입니다. Labyrinthos는 이 카드를 무서운 끝이 아닌 '변형(Transformation)'이라고 강조합니다. 낡은 껍질을 깨는 고통이 따르겠지만, 그 끝엔 더 강인하고 새로운 당신이 기다리고 있습니다.",
    image: '/images/tarot/6-death.png',
    color: '#1a1a1a',
  },
  {
    id: 7,
    name: 'The Devil',
    nameKo: '악마',
    flavorTag: 'Peat',
    readingText:
      "위험한 줄 알면서도 끌리는, 치명적인 유혹에 빠져있군요. 타로 가이드는 이를 '벗어날 수 없는 쾌락과 욕망'으로 해석합니다. 이성적으로는 거부하려 해도 본능은 이미 답을 알고 있네요. 가끔은 그 욕망에 솔직해져 보는 건 어떨까요?",
    image: '/images/tarot/7-devil.png',
    color: '#4a0e0e',
  },
  {
    id: 8,
    name: 'The Moon',
    nameKo: '달',
    flavorTag: 'Peat',
    readingText:
      "안개 속을 걷는 듯 불안하지만, 당신의 느낌을 믿으세요. Biddy Tarot은 이 시기를 '환상과 무의식의 시간'이라 부릅니다. 눈에 보이는 것이 다가 아닙니다. 논리보다 당신의 예민해진 직관이 정답을 알려줄 것입니다.",
    image: '/images/tarot/8-moon.png',
    color: '#1a1a2e',
  },
  {
    id: 9,
    name: 'The Sun',
    nameKo: '태양',
    flavorTag: 'Fresh',
    readingText:
      "구름 한 점 없는 맑은 하늘처럼, 당신의 앞날은 쾌청합니다. Labyrinthos는 타로에서 가장 긍정적인 카드로 '순수한 기쁨'을 꼽습니다. 걱정은 접어두세요. 당신이 가는 길에 따뜻한 햇살과 축복만이 가득할 것입니다.",
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

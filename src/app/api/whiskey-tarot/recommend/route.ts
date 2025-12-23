import { NextRequest, NextResponse } from 'next/server';
import {
  TarotCard,
  WhiskyRecommend,
  RecommendRequest,
  RecommendResponse,
  FlavorTag,
} from '@/app/(custom)/whiskey-tarot/_types';

// 10장의 타로 카드 데이터 (cards/route.ts와 동일)
const TAROT_CARDS: TarotCard[] = [
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
    flavorTag: 'Fresh',
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
    flavorTag: 'Peat',
    readingText:
      "끝이 아니라, 완전히 새로운 모습으로 다시 태어날 시간입니다. Labyrinthos는 이 카드를 무서운 끝이 아닌 '변형(Transformation)'이라고 강조합니다. 낡은 껍질을 깨는 고통이 따르겠지만, 그 끝엔 더 강인하고 새로운 당신이 기다리고 있습니다.",
    image: '/images/tarot/6-death.png',
    color: '#1a1a1a',
  },
  {
    id: 7,
    name: 'The Devil',
    nameKo: '악마',
    flavorTag: 'Sweet',
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
const WHISKY_BY_CATEGORY: Record<FlavorTag, WhiskyRecommend> = {
  Fresh: {
    category: 'Fresh',
    name: 'Glenmorangie Original',
    nameKo: '글렌모렌지 오리지널',
    description: '시트러스한 향기가 기분을 밝게 해줍니다.',
    emoji: '🍋',
  },
  Sweet: {
    category: 'Sweet',
    name: 'The Balvenie 12',
    nameKo: '발베니 12년',
    description: '꿀처럼 달콤하고 부드러운 위로가 됩니다.',
    emoji: '🍯',
  },
  Peat: {
    category: 'Peat',
    name: 'Ardbeg 10',
    nameKo: '아드벡 10년',
    description: '깊고 스모키한 향이 고독을 즐기게 해줍니다.',
    emoji: '🔥',
  },
  Strong: {
    category: 'Strong',
    name: 'Wild Turkey 101',
    nameKo: '와일드 터키 101',
    description: '타협하지 않는 강렬한 타격감을 선사합니다.',
    emoji: '💪',
  },
  Balance: {
    category: 'Balance',
    name: 'Johnnie Walker Black',
    nameKo: '조니워커 블랙',
    description: '복잡한 마음을 조화롭게 감싸주는 완벽한 밸런스입니다.',
    emoji: '⚖️',
  },
};

// Flavor Tag별 점수 계산
function calculateFlavorScore(cards: TarotCard[]): Record<FlavorTag, number> {
  const score: Record<FlavorTag, number> = {
    Fresh: 0,
    Sweet: 0,
    Peat: 0,
    Strong: 0,
    Balance: 0,
  };

  for (const card of cards) {
    score[card.flavorTag]++;
  }

  return score;
}

// 가장 높은 점수의 Flavor Tag 찾기
function findDominantFlavor(score: Record<FlavorTag, number>): FlavorTag {
  const relevantTags: FlavorTag[] = ['Fresh', 'Sweet', 'Peat', 'Strong'];
  const counts = relevantTags.map((tag) => score[tag]);
  const maxCount = Math.max(...counts);

  // 최고 점수를 가진 태그들
  const topTags = relevantTags.filter((tag) => score[tag] === maxCount);

  // 1:1:1 동점 (3장 모두 다른 태그) -> Balance
  if (topTags.length >= 3 || (topTags.length === 2 && maxCount === 1)) {
    return 'Balance';
  }

  // 2:1 또는 3:0 -> 최다 태그 반환
  return topTags[0];
}

// 매칭 이유 생성 함수
function generateMatchReason(cards: TarotCard[], whisky: WhiskyRecommend): string {
  const cardNames = cards.map((c) => c.nameKo).join(', ');

  if (whisky.category === 'Balance') {
    return `${cardNames} 카드가 이끈 당신의 복잡한 마음에\n완벽한 조화를 선사하는 ${whisky.nameKo}를 추천합니다.`;
  }

  const flavorDescriptions: Record<FlavorTag, string> = {
    Fresh: '상큼하고 가벼운 시작',
    Sweet: '달콤하고 풍요로운 휴식',
    Peat: '깊고 스모키한 고독',
    Strong: '강렬하고 단단한 의지',
    Balance: '완벽한 조화',
  };

  return `${flavorDescriptions[whisky.category]}을 원하는 당신에게\n${whisky.nameKo}를 추천합니다.`;
}

export async function POST(request: NextRequest) {
  try {
    const body: RecommendRequest = await request.json();
    const { selectedCardIds } = body;

    if (!selectedCardIds || selectedCardIds.length !== 3) {
      return NextResponse.json(
        { error: '3장의 카드를 선택해주세요.' },
        { status: 400 }
      );
    }

    // 선택된 카드 찾기
    const selectedCards = selectedCardIds
      .map((id) => TAROT_CARDS.find((card) => card.id === id))
      .filter((card): card is TarotCard => card !== undefined);

    if (selectedCards.length !== 3) {
      return NextResponse.json(
        { error: '유효하지 않은 카드 ID입니다.' },
        { status: 400 }
      );
    }

    // Flavor Tag 점수 계산
    const flavorScore = calculateFlavorScore(selectedCards);

    // 우세한 Flavor Tag 찾기
    const dominantFlavor = findDominantFlavor(flavorScore);

    // 해당 카테고리의 위스키 가져오기
    const recommendedWhisky = WHISKY_BY_CATEGORY[dominantFlavor];

    // 매칭 이유 생성
    const matchReason = generateMatchReason(selectedCards, recommendedWhisky);

    const response: RecommendResponse = {
      selectedCards,
      recommendedWhisky,
      matchReason,
      flavorScore,
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { error: '요청 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

import BartenderExperience from './_components/BartenderExperience';
import { demoCurations, demoWhiskies } from './_data/demo';
import { MOCK_SCENARIO_CONTEXT } from './_scenario/mockScenario';

export const metadata = {
  title: '바텐더 노트 | 보틀노트',
  description:
    '바텐더 노트와 함께 취향에 맞는 위스키를 찾고, 오늘 마신 술을 기록하세요.',
};

export default function BartenderNotePage() {
  return (
    <BartenderExperience
      whiskies={demoWhiskies}
      curations={demoCurations}
      scenarioContext={MOCK_SCENARIO_CONTEXT}
    />
  );
}

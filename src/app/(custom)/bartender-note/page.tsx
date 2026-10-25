import BartenderExperience from './_components/BartenderExperience';
import { demoCurations, demoWhiskies } from './_data/demo';

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
      scenarioContext={{
        scenarioId: Number(process.env.BARTENDER_SCENARIO_ID ?? 3),
      }}
    />
  );
}

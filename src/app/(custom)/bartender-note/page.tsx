import BartenderExperience from './_components/BartenderExperience';
import { parseSimilarEntry } from './_components/similarEntry';

/** 시나리오 목록에서 바텐더 노트를 찾는 코드. 다른 시나리오는 아직 노출하지 않는다. */
const BARTENDER_SCENARIO_CODE = 'bartender-note';

export const metadata = {
  title: '바텐더 노트 | 보틀노트',
  description:
    '바텐더 노트와 함께 취향에 맞는 위스키를 찾고, 오늘 마신 술을 기록하세요.',
};

export default function BartenderNotePage({
  searchParams = {},
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  return (
    <BartenderExperience
      scenarioContext={{ code: BARTENDER_SCENARIO_CODE }}
      similarEntry={parseSimilarEntry(searchParams)}
    />
  );
}

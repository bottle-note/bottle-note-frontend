import SkeletonBase from '@/components/ui/Loading/Skeletons/SkeletonBase';
import type { Step } from './types';
import {
  OptionList,
  FlowAction,
  FlowNavigation,
  FlowTextAction,
} from './FlowControls';
import type { useCurationChoices } from './useBartenderCurations';

type Props = {
  step: Step;
  choices: ReturnType<typeof useCurationChoices>;
  setCurationId: (id: number) => void;
  move: (next: Step) => void;
  home: () => void;
  onStartScenario: () => void;
};

/** 큐레이션 목록. 고르면 그 큐레이션에 담긴 술 목록으로 간다. */
export default function CurationFlow({
  step,
  choices,
  setCurationId,
  move,
  home,
  onStartScenario,
}: Props) {
  if (step !== 'curations') return null;
  if (choices.state === 'loading')
    return (
      <div role="status" className="flex flex-col gap-12">
        <span className="text-15">큐레이션을 불러오고 있어요…</span>
        <SkeletonBase height={48} count={3} />
      </div>
    );
  if (choices.state === 'error')
    return (
      <>
        <p role="alert" className="m-0 text-15 text-fg-neutral">
          큐레이션을 불러오지 못했어요. 다시 시도해 주세요.
        </p>
        <FlowAction onClick={choices.retry}>다시 시도</FlowAction>
        <FlowNavigation>
          <FlowTextAction onClick={home}>처음으로</FlowTextAction>
        </FlowNavigation>
      </>
    );
  if (choices.state === 'empty')
    return (
      <>
        <FlowAction onClick={onStartScenario}>취향으로 골라 주세요</FlowAction>
        <FlowNavigation>
          <FlowTextAction onClick={home}>처음으로</FlowTextAction>
        </FlowNavigation>
      </>
    );
  return (
    <>
      <OptionList
        // 큐레이션 설명은 길어서 제목만 보인다
        items={choices.items.map((item) => ({
          title: item.name,
          action: () => {
            setCurationId(item.id);
            move('curation-list');
          },
        }))}
      />
      {choices.nextError && (
        <p role="alert" className="m-0 text-13 text-fg-neutral-muted">
          다른 큐레이션을 불러오지 못했어요. 다시 눌러 주세요.
        </p>
      )}
      <FlowNavigation>
        {choices.hasNext && (
          <FlowTextAction
            onClick={choices.showNext}
            disabled={choices.loadingNext}
          >
            다른 큐레이션 보기
          </FlowTextAction>
        )}
        {choices.page > 0 && !choices.hasNext && (
          <FlowTextAction onClick={choices.showFirst}>
            처음 큐레이션부터 보기
          </FlowTextAction>
        )}
        <FlowTextAction onClick={home}>처음으로</FlowTextAction>
      </FlowNavigation>
    </>
  );
}

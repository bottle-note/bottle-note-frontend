import { useState, type Dispatch, type SetStateAction } from 'react';
import type { Step } from './types';
import { OptionList, FlowAction } from './FlowControls';
import { situations, type Curation, type Situation } from '../_data/demo';

type Props = {
  step: Step;
  curations: Curation[];
  situation: Situation;
  setSituation: Dispatch<SetStateAction<Situation>>;
  setCurationId: Dispatch<SetStateAction<number | null>>;
  move: (next: Step) => void;
  home: () => void;
};

export default function CurationFlow({
  step,
  curations,
  situation,
  setSituation,
  setCurationId,
  move,
  home,
}: Props) {
  const [page, setPage] = useState(0);
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const active = curations.filter(
    (item) =>
      (!item.start || item.start <= today) && (!item.end || today <= item.end),
  );
  const choices = active
    .filter((item) => item.situation === situation)
    .sort(
      (a, b) => (b.start ?? '').localeCompare(a.start ?? '') || a.id - b.id,
    );
  const optionList = (items: Parameters<typeof OptionList>[0]['items']) => (
    <OptionList items={items} />
  );
  return (
    <>
      {step === 'situation' &&
        optionList(
          (
            Object.entries(situations) as [
              Situation,
              { title: string; subtitle: string },
            ][]
          ).map(([key, value]) => ({
            title: value.title,
            description: value.subtitle,
            action: () => {
              setSituation(key);
              setPage(0);
              const found = active.filter((item) => item.situation === key);
              if (found.length === 0) move('curation-empty');
              else if (found.length === 1) {
                setCurationId(found[0].id);
                move('curation-list');
              } else move('curations');
            },
          })),
        )}
      {step === 'curation-empty' && (
        <>
          <FlowAction primary onClick={() => move('level')}>
            취향으로 골라 주세요
          </FlowAction>
          <FlowAction onClick={() => move('situation')}>
            다른 자리 볼게요
          </FlowAction>
        </>
      )}
      {step === 'curations' && (
        <>
          {optionList(
            choices.slice(page * 3, page * 3 + 3).map((item) => ({
              title: item.title,
              description: item.description,
              action: () => {
                setCurationId(item.id);
                move('curation-list');
              },
            })),
          )}
          {choices.length > (page + 1) * 3 && (
            <FlowAction onClick={() => setPage(page + 1)}>
              다른 큐레이션도 볼게요
            </FlowAction>
          )}
          {page > 0 && choices.length <= (page + 1) * 3 && (
            <FlowAction onClick={() => setPage(0)}>
              처음 큐레이션부터 볼게요
            </FlowAction>
          )}
          <FlowAction onClick={() => move('situation')}>
            ‹ 다른 자리 볼게요
          </FlowAction>
          <FlowAction onClick={home}>처음으로 갈게요</FlowAction>
        </>
      )}
    </>
  );
}

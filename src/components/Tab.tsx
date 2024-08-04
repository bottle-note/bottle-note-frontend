import { HISTORY_TYPES } from '@/constants/user';

interface Props {
  currentTab: { name: string; id: string };
  handleTab: (id: string) => void;
}

const Tab = ({ currentTab, handleTab }: Props) => {
  return (
    <div className="flex gap-3 relative">
      {HISTORY_TYPES.map((type) => {
        return (
          <button
            key={type.id}
            className={`${currentTab.id === type.id ? 'tab-selected' : 'tab-default'} pb-2 w-full font-bold text-[0.938rem] text-center leading-[17.2px]`}
            onClick={() => handleTab(type.id)}
          >
            {type.name}
          </button>
        );
      })}
    </div>
  );
};

export default Tab;

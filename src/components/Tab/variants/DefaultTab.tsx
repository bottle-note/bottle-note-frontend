interface Props<T> {
  currentTab: T;
  handleTab: (id: string) => void;
  tabList: T[];
}

const DefaultTab = <T extends { id: string; name: string }>({
  currentTab,
  handleTab,
  tabList,
}: Props<T>) => {
  return (
    <div className="flex gap-3 relative">
      {tabList.map((type) => {
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

export default DefaultTab;

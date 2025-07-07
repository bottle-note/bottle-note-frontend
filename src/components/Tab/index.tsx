import DefaultTab from './variants/DefaultTab';
import BookmarkTab from './variants/BookmarkTab';

interface TabItem {
  id: string;
  name: string;
}

interface BaseTabProps<T extends TabItem> {
  currentTab: T;
  tabList: T[];
  handleTab: (id: string) => void;
}

interface BookmarkTabProps<T extends TabItem> extends BaseTabProps<T> {
  variant: 'bookmark';
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
  registerTab?: (
    id: string,
  ) => (el: HTMLDivElement | HTMLButtonElement | null) => void;
}

interface DefaultTabProps<T extends TabItem> extends BaseTabProps<T> {
  variant?: null | undefined;
}

type TabProps<T extends TabItem> = BookmarkTabProps<T> | DefaultTabProps<T>;

function Tab<T extends TabItem>({ ...props }: TabProps<T>) {
  const renderTabList = () => {
    if (props.variant === 'bookmark') {
      return (
        <BookmarkTab
          currentTab={props.currentTab}
          tabList={props.tabList}
          handleTab={props.handleTab}
          scrollContainerRef={props.scrollContainerRef}
          registerTab={props.registerTab}
        />
      );
    }

    return (
      <DefaultTab
        currentTab={props.currentTab}
        tabList={props.tabList}
        handleTab={props.handleTab}
      />
    );
  };

  return <section>{renderTabList()}</section>;
}

Tab.Default = DefaultTab;
Tab.Bookmark = BookmarkTab;

export default Tab;

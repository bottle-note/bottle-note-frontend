'use client';

import { useRef, useEffect } from 'react';
import { useTab } from '@/hooks/useTab';

interface Props {
  list: { id: string; name: string }[];
  onSelect?: (id: string) => void;
}

const TAB_WIDTH = 146;
const TAB_HEIGHT = 32;

const BORDER_COLOR = '#CFCFCF';
const BORDER_WIDTH = 1.5;
const ACTIVE_BOTTOM_COVER = 2;

const TabNavigation = ({ list, onSelect }: Props) => {
  const { currentTab, handleTab, tabList } = useTab({ tabList: list });
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeTabElement = document.getElementById(`tab-${currentTab.id}`);
      if (activeTabElement) {
        scrollContainerRef.current.scrollLeft =
          activeTabElement.offsetLeft - 16;
      }
    }
  }, [currentTab.id]);

  const handleSelect = (id: string) => {
    handleTab(id);
    onSelect?.(id);
  };

  return (
    <div className="w-full bg-white">
      <div className="relative">
        {/* 전체 하단 라인 */}
        <div
          className="absolute left-0 right-0"
          style={{
            bottom: 0,
            height: `${BORDER_WIDTH}px`,
            backgroundColor: BORDER_COLOR,
            zIndex: 0,
          }}
        />

        {/* 탭 컨테이너 */}
        <div
          ref={scrollContainerRef}
          className="relative flex overflow-x-auto scrollbar-hide w-full scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex">
            {tabList.map((tab, index) => (
              <div
                key={tab.id}
                id={`tab-${tab.id}`}
                className={`relative ${index === 0 ? 'ml-4' : '-ml-3'}`}
                style={{
                  zIndex:
                    currentTab.id === tab.id
                      ? list.length + 1
                      : list.length - index,
                }}
              >
                <button
                  onClick={() => handleSelect(tab.id)}
                  className="relative flex items-center justify-center"
                  style={{
                    width: `${TAB_WIDTH}px`,
                    height: `${TAB_HEIGHT}px`,
                    background: 'transparent',
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={TAB_WIDTH}
                    height={TAB_HEIGHT}
                    viewBox={`0 0 ${TAB_WIDTH} ${TAB_HEIGHT}`}
                    className="absolute inset-0"
                    preserveAspectRatio="none"
                  >
                    {/* 테두리 경로 */}
                    <path
                      d={`
                        M0,${TAB_HEIGHT}
                        L12,8
                        Q14,2 22,2
                        H${TAB_WIDTH - 22}
                        Q${TAB_WIDTH - 14},2 ${TAB_WIDTH - 12},8
                        L${TAB_WIDTH},${TAB_HEIGHT}
                      `}
                      fill={currentTab.id === tab.id ? '#FFF' : '#F7F7F7'}
                      stroke={BORDER_COLOR}
                      strokeWidth={BORDER_WIDTH}
                      strokeLinejoin="round"
                    />
                    {/* 하단 border: 비활성 탭만 표시 */}
                    {currentTab.id !== tab.id && (
                      <line
                        x1="0"
                        y1={TAB_HEIGHT}
                        x2={TAB_WIDTH}
                        y2={TAB_HEIGHT}
                        stroke={BORDER_COLOR}
                        strokeWidth={BORDER_WIDTH}
                        strokeLinecap="butt"
                      />
                    )}
                    {/* 활성 탭 하단 흰색 덮개 */}
                    {currentTab.id === tab.id && (
                      <line
                        x1="0"
                        y1={TAB_HEIGHT}
                        x2={TAB_WIDTH}
                        y2={TAB_HEIGHT}
                        stroke="#FFF"
                        strokeWidth={ACTIVE_BOTTOM_COVER}
                        strokeLinecap="butt"
                      />
                    )}
                  </svg>
                  <span
                    className={`relative z-10 text-15 font-extrabold ${
                      currentTab.id === tab.id
                        ? 'text-orange-500'
                        : 'text-gray-400'
                    }`}
                  >
                    {tab.name}
                  </span>
                </button>
              </div>
            ))}
          </div>
          {/* 오른쪽 여백 하단 라인 */}
          <div
            className="flex-grow min-w-[20px]"
            style={{ borderBottom: `${BORDER_WIDTH}px solid ${BORDER_COLOR}` }}
          />
        </div>
      </div>
    </div>
  );
};

export default TabNavigation;

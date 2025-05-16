'use client';

import { RefObject } from 'react';

type Props<T extends { id: string; name: string }> = {
  currentTab: T;
  handleTab: (id: string) => void;
  registerTab?: (
    id: string,
  ) => (el: HTMLDivElement | HTMLButtonElement | null) => void;
  tabList: T[];
};

const TAB_WIDTH = 146;
const TAB_HEIGHT = 32;

const BORDER_COLOR = '#CFCFCF';
const BORDER_WIDTH = 1.5;

const BookmarkTab = <T extends { id: string; name: string }>({
  currentTab,
  handleTab,
  tabList,
  scrollContainerRef,
  registerTab,
}: Props<T> & {
  scrollContainerRef?: RefObject<HTMLDivElement>;
}) => {
  return (
    <div className="w-full bg-white">
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="relative flex overflow-x-auto scrollbar-hide w-full scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex">
            {tabList.map((tab, index) => (
              <div
                key={tab.id}
                ref={registerTab?.(tab.id)}
                className={`relative ${index === 0 ? 'ml-4' : '-ml-3'}`}
                style={{
                  zIndex:
                    currentTab.id === tab.id
                      ? tabList.length + 1
                      : tabList.length - index,
                }}
              >
                <button
                  onClick={() => handleTab(tab.id)}
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
                    <defs>
                      <clipPath id={`tab-clip-${tab.id}`}>
                        <path
                          d={`
                            M0,${TAB_HEIGHT}
                            L12,8
                            Q14,2 22,2
                            H${TAB_WIDTH - 22}
                            Q${TAB_WIDTH - 14},2 ${TAB_WIDTH - 12},8
                            L${TAB_WIDTH},${TAB_HEIGHT}
                          `}
                        />
                      </clipPath>
                    </defs>

                    {/* 배경색 적용 */}
                    <rect
                      x="0"
                      y="0"
                      width={TAB_WIDTH}
                      height={TAB_HEIGHT}
                      fill={currentTab.id === tab.id ? '#FFF' : '#F7F7F7'}
                      clipPath={`url(#tab-clip-${tab.id})`}
                    />

                    {/* 테두리 외곽선 - 하단 제외 */}
                    <path
                      d={`
                        M0,${TAB_HEIGHT}
                        L12,8
                        Q14,2 22,2
                        H${TAB_WIDTH - 22}
                        Q${TAB_WIDTH - 14},2 ${TAB_WIDTH - 12},8
                        L${TAB_WIDTH},${TAB_HEIGHT}
                      `}
                      fill="none"
                      stroke={BORDER_COLOR}
                      strokeWidth={BORDER_WIDTH}
                      strokeLinejoin="round"
                    />

                    {/* 하단 선 - 비활성 탭만 */}
                    {currentTab.id !== tab.id && (
                      <line
                        x1="0"
                        y1={TAB_HEIGHT - BORDER_WIDTH / 2}
                        x2={TAB_WIDTH}
                        y2={TAB_HEIGHT - BORDER_WIDTH / 2}
                        stroke={BORDER_COLOR}
                        strokeWidth={BORDER_WIDTH}
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
            style={{
              borderBottom: `${BORDER_WIDTH}px solid ${BORDER_COLOR}`,
              marginTop: `${TAB_HEIGHT - BORDER_WIDTH}px`,
            }}
          />
        </div>
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
      </div>
    </div>
  );
};

export default BookmarkTab;

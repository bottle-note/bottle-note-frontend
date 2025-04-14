'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';

interface TabItem {
  id: string;
  name: string;
}

interface Props {
  items: TabItem[];
  activeId?: string;
  onSelect?: (id: string) => void;
  children?: ReactNode;
}

const TabNavigation = ({ items, activeId, onSelect, children }: Props) => {
  const [activeTab, setActiveTab] = useState(activeId || items[0]?.id || '');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 활성 탭으로 스크롤 이동
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeTabElement = document.getElementById(`tab-${activeTab}`);
      if (activeTabElement) {
        scrollContainerRef.current.scrollLeft =
          activeTabElement.offsetLeft - 13;
      }
    }
  }, [activeTab]);

  const handleSelect = (id: string) => {
    setActiveTab(id);
    onSelect?.(id);
  };

  return (
    <div className="w-full">
      <div className="relative">
        {/* 전체 하단 테두리 */}
        <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gray-300" />

        {/* 스크롤 가능한 탭 컨테이너 */}
        <div
          ref={scrollContainerRef}
          className="relative flex overflow-x-auto scrollbar-hide w-full"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex">
            {items.map((tab, index) => (
              <div
                key={tab.id}
                id={`tab-${tab.id}`}
                className={`relative ${index === 0 ? 'ml-[13px]' : '-ml-[10px]'}`}
                style={{
                  zIndex:
                    activeTab === tab.id
                      ? items.length + 1
                      : items.length - index,
                }}
              >
                <button
                  onClick={() => handleSelect(tab.id)}
                  className="relative flex items-center justify-center h-[28.5px] w-[146px]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="146"
                    height="28.5"
                    viewBox="0 0 146 28.5"
                    className="absolute inset-0"
                  >
                    <path
                      d="M0,28.5 L10,8 C11,3.5 14,0 19,0 H127 C132,0 135,3.5 136,8 L146,28.5 Z"
                      fill={activeTab === tab.id ? '#FFFFFF' : '#F3F3F3'}
                      stroke={activeTab === tab.id ? '#F4A460' : '#D3D3D3'}
                      strokeWidth="1.5"
                    />
                    {/* 활성화된 탭은 하단 테두리 제거 */}
                    {activeTab === tab.id && (
                      <line
                        x1="-1"
                        y1="28.5"
                        x2="147"
                        y2="28.5"
                        stroke="#FFFFFF"
                        strokeWidth="3"
                      />
                    )}
                  </svg>
                  <span
                    className={`relative z-10 text-sm font-medium ${
                      activeTab === tab.id ? 'text-orange-500' : 'text-gray-400'
                    }`}
                  >
                    {tab.name}
                  </span>
                </button>
              </div>
            ))}
          </div>
          <div className="flex-grow" />
        </div>
      </div>
      <div className="p-4 bg-white">{children}</div>
    </div>
  );
};

export default TabNavigation;

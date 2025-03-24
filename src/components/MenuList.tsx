import React from 'react';

interface MenuItem {
  id: string;
  name: string;
}

interface Props {
  items: MenuItem[];
  activeId?: string;
  onSelect?: (id: string) => void;
}

function MenuList({ items, activeId, onSelect }: Props) {
  const isSingleMenu = items.length === 1;

  const getButtonStyle = (isSingle: boolean, isActive: boolean) => {
    if (isSingle) return 'bg-bgGray text-subCoral';
    if (isActive) return 'bg-bgGray text-subCoral';
    return 'bg-subCoral/20 text-black hover:bg-subCoral/20';
  };

  const getHoverEffect = (isSingle: boolean, isActive: boolean) => {
    if (isSingle || isActive) return '';
    return `
      transform 
      hover:translate-x-1 hover:-translate-y-1 hover:bg-subCoral/50
      active:translate-x-0.5 active:-translate-y-0.5
    `;
  };

  return (
    <div className="border-b-[1.4px] border-subCoral">
      <div className="flex">
        {items.slice(0, 3).map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect?.(item.id)}
            onTouchStart={(e) => {
              if (!isSingleMenu && item.id !== activeId) {
                e.currentTarget.classList.add(
                  'translate-x-1',
                  '-translate-y-1',
                  'bg-subCoral/50',
                );
              }
            }}
            onTouchEnd={(e) => {
              if (!isSingleMenu && item.id !== activeId) {
                e.currentTarget.classList.remove(
                  'translate-x-1',
                  '-translate-y-1',
                  'bg-subCoral/50',
                );
              }
            }}
            className={`
              min-w-[165px] py-[6px] px-4
              text-15 font-extrabold
              rounded-tl-md rounded-tr-md
              transition-all duration-300 ease-out
              ${getHoverEffect(isSingleMenu, item.id === activeId)}
              ${getButtonStyle(isSingleMenu, item.id === activeId)}
              ${!isSingleMenu && 'cursor-pointer'}
            `}
            disabled={isSingleMenu}
          >
            <p className="whitespace-nowrap">{item.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default MenuList;

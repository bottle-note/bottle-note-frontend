'use client';

import useTooltipStore from '@/store/tooltipStore';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { setActiveTooltip } = useTooltipStore();

  return (
    <div
      onClick={() => setActiveTooltip(null)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          setActiveTooltip(null);
        }
      }}
    >
      {children}
    </div>
  );
}

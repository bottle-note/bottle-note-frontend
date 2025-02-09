import { create } from 'zustand';

interface TooltipStore {
  activeTooltip: string | null;
  setActiveTooltip: (id: string | null) => void;
}

const useTooltipStore = create<TooltipStore>((set) => ({
  activeTooltip: null,
  setActiveTooltip: (id) => set({ activeTooltip: id }),
}));

export default useTooltipStore;

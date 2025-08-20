import { create } from 'zustand';

interface RelationshipsState {
  blockedList: string[];
  addBlocked: (userId: string) => void;
  removeBlocked: (userId: string) => void;
  setBlocked: (userIds: string[]) => void;
  isUserBlocked: (userId: string) => boolean;
}

const useRelationshipsStore = create<RelationshipsState>((set, get) => ({
  blockedList: [],
  addBlocked: (userId) =>
    set((state) => ({ blockedList: [...state.blockedList, userId] })),
  removeBlocked: (userId) =>
    set((state) => ({
      blockedList: state.blockedList.filter((id) => id !== userId),
    })),
  setBlocked: (userIds) => set({ blockedList: userIds }),
  isUserBlocked: (userId) => get().blockedList.includes(userId),
}));

export default useRelationshipsStore;

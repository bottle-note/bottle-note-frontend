import { create } from 'zustand';

interface ModalStore {
  isShowModal: boolean;
  isShowLoginModal: boolean;
  handleModal: () => void;
  handleLoginModal: () => void;
}

const useModalStore = create<ModalStore>((set) => ({
  isShowModal: false,
  isShowLoginModal: false,
  handleModal: () => set((state) => ({ isShowModal: !state.isShowModal })),
  handleLoginModal: () =>
    set((state) => ({ isShowLoginModal: !state.isShowLoginModal })),
}));

export default useModalStore;

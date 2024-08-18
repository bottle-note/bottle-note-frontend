import { create } from 'zustand';

interface ModalState {
  isShowModal: boolean;
  type: 'ALERT' | 'CONFIRM';
  mainText: string;
  subText: string;
  alertBtnName: string;
  confirmBtnName: string;
  cancelBtnName: string;
  handleCancel: (() => void) | null;
  handleConfirm: (() => void) | null;
}

type ParcialModalState = {
  [K in keyof ModalState]?: ModalState[K];
};

interface ModalStore {
  state: ModalState;
  handleModalState: (state: ParcialModalState) => void;
  handleCloseModal: () => void;
}

const useModalStore = create<ModalStore>((set) => ({
  state: {
    isShowModal: false,
    type: 'ALERT',
    mainText: '',
    subText: '',
    alertBtnName: '확인',
    confirmBtnName: '취소',
    cancelBtnName: '확인',
    handleCancel: null,
    handleConfirm: null,
  },
  handleModalState: (newState) =>
    set((state) => ({
      state: {
        ...state.state,
        ...newState,
      },
    })),
  handleCloseModal: () => {
    set((state) => ({ state: { ...state.state, isShowModal: false } }));
  },
}));

export default useModalStore;

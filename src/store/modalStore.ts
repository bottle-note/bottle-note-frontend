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

interface LoginModalState {
  isShowLoginModal: boolean;
}

export type ParcialModalState = {
  [K in keyof ModalState]?: ModalState[K];
};

interface ModalStore {
  state: ModalState;
  loginState: LoginModalState;
  handleModalState: (state: ParcialModalState) => void;
  handleLoginState: (state: boolean) => void;
  handleCloseModal: () => void;
  handleLoginModal: () => void;
}

const useModalStore = create<ModalStore>((set) => ({
  state: {
    isShowModal: false,
    type: 'ALERT',
    mainText: '',
    subText: '',
    alertBtnName: '확인',
    confirmBtnName: '예',
    cancelBtnName: '아니요',
    handleCancel: null,
    handleConfirm: null,
  },
  loginState: {
    isShowLoginModal: false,
  },
  handleLoginState: (newState) =>
    set({ loginState: { isShowLoginModal: newState } }),
  handleModalState: (newState) =>
    set((state) => ({
      state: {
        ...state.state,
        ...newState,
      },
    })),
  handleCloseModal: () => {
    set({
      state: {
        isShowModal: false,
        type: 'ALERT',
        mainText: '',
        subText: '',
        alertBtnName: '확인',
        confirmBtnName: '예',
        cancelBtnName: '아니요',
        handleCancel: null,
        handleConfirm: null,
      },
    });
  },
  handleLoginModal: () =>
    set((state) => ({
      loginState: {
        ...state.loginState,
        isShowLoginModal: !state.loginState.isShowLoginModal,
      },
    })),
}));

export default useModalStore;

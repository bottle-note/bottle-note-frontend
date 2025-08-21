import useModalStore from '@/store/modalStore';
import useRelationshipsStore from '@/store/relationshipsStore';
import { BlockApi } from '@/app/api/BlockApi';

interface UseBlockActionsOptions {
  onBlockStart?: (userId: string) => void;
  onBlockSuccess?: (userId: string) => void;
  onBlockError?: (userId: string) => void;
  onUnblockStart?: (userId: string) => void;
  onUnblockSuccess?: (userId: string) => void;
  onUnblockError?: (userId: string) => void;
}

export const useBlockActions = (options: UseBlockActionsOptions = {}) => {
  const { handleModalState } = useModalStore();
  const { addBlocked, removeBlocked } = useRelationshipsStore();

  const handleBlockUser = (userId: string, userName: string) => {
    handleModalState({
      isShowModal: true,
      type: 'CONFIRM',
      mainText: `${userName}님을 차단하시겠습니까?`,
      handleConfirm: async () => {
        try {
          options.onBlockStart?.(userId);
          await BlockApi.blockUser(userId);
          addBlocked(String(userId));
          options.onBlockSuccess?.(userId);

          handleModalState({
            isShowModal: true,
            type: 'ALERT',
            mainText: '성공적으로 차단되었습니다.',
            handleConfirm: () => {
              handleModalState({
                isShowModal: false,
                mainText: '',
              });
            },
          });
        } catch (error) {
          console.error('차단 실패:', error);
          options.onBlockError?.(userId);

          handleModalState({
            isShowModal: true,
            type: 'ALERT',
            mainText: '차단에 실패했습니다.',
            handleConfirm: () => {
              handleModalState({
                isShowModal: false,
                mainText: '',
              });
            },
          });
        }
      },
      handleCancel: () => {
        handleModalState({
          isShowModal: false,
          mainText: '',
        });
      },
    });
  };

  const handleUnblockUser = (userId: string, userName: string) => {
    handleModalState({
      isShowModal: true,
      type: 'CONFIRM',
      mainText: `${userName}님을 차단 해제하시겠습니까?`,
      handleConfirm: async () => {
        try {
          options.onUnblockStart?.(userId);
          await BlockApi.unblockUser(userId);
          removeBlocked(String(userId));
          options.onUnblockSuccess?.(userId);

          handleModalState({
            isShowModal: false,
            mainText: '',
            subText: '',
          });
        } catch (error) {
          console.error('차단 해제 실패:', error);
          options.onUnblockError?.(userId);

          handleModalState({
            isShowModal: false,
            mainText: '',
            subText: '',
          });
        }
      },
      handleCancel: () => {
        handleModalState({
          isShowModal: false,
          mainText: '',
          subText: '',
        });
      },
    });
  };

  return {
    handleBlockUser,
    handleUnblockUser,
  };
};

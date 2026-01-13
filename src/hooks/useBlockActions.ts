import useModalStore from '@/store/modalStore';
import useRelationshipsStore from '@/store/relationshipsStore';
import { BlockApi } from '@/api/block/block.api';

interface UseBlockActionsOptions {
  onBlockStart?: (userId: string) => void;
  onBlockSuccess?: (userId: string) => void;
  onBlockError?: (userId: string) => void;
  onUnblockStart?: (userId: string) => void;
  onUnblockSuccess?: (userId: string) => void;
  onUnblockError?: (userId: string) => void;
}

export const useBlockActions = (options: UseBlockActionsOptions = {}) => {
  const { handleModalState, handleCloseModal } = useModalStore();
  const { addBlocked, removeBlocked } = useRelationshipsStore();

  const showSuccessAlert = (message: string) => {
    handleModalState({
      isShowModal: true,
      type: 'ALERT',
      mainText: message,
      handleConfirm: handleCloseModal,
    });
  };

  const showErrorAlert = (message: string) => {
    handleModalState({
      isShowModal: true,
      type: 'ALERT',
      mainText: message,
      handleConfirm: handleCloseModal,
    });
  };

  const performBlockAction = async (
    userId: string,
    action: () => Promise<void>,
    onStart?: (userId: string) => void,
    onSuccess?: (userId: string) => void,
    onError?: (userId: string) => void,
    successMessage?: string,
    errorMessage?: string,
  ) => {
    try {
      onStart?.(userId);
      await action();
      onSuccess?.(userId);

      if (successMessage) {
        showSuccessAlert(successMessage);
      } else {
        handleCloseModal();
      }
    } catch (error) {
      console.error('Block action failed:', error);
      onError?.(userId);
      showErrorAlert(
        errorMessage || '작업에 실패했습니다. 운영자에게 문의해주세요.',
      );
    }
  };

  const handleBlockUser = (userId: string, userName: string) => {
    handleModalState({
      isShowModal: true,
      type: 'CONFIRM',
      mainText: `${userName}님을 차단하시겠습니까?`,
      handleConfirm: () => {
        performBlockAction(
          userId,
          async () => {
            await BlockApi.blockUser(userId);
            addBlocked(String(userId));
          },
          options.onBlockStart,
          options.onBlockSuccess,
          options.onBlockError,
          '성공적으로 차단되었습니다.',
          '차단에 실패했습니다. 운영자에게 문의해주세요.',
        );
      },
    });
  };

  const handleUnblockUser = (userId: string, userName: string) => {
    handleModalState({
      isShowModal: true,
      type: 'CONFIRM',
      mainText: `${userName}님을 차단 해제하시겠습니까?`,
      handleConfirm: () => {
        performBlockAction(
          userId,
          async () => {
            await BlockApi.unblockUser(userId);
            removeBlocked(String(userId));
          },
          options.onUnblockStart,
          options.onUnblockSuccess,
          options.onUnblockError,
          undefined,
          '차단 해제에 실패했습니다. 운영자에게 문의해주세요.',
        );
      },
    });
  };

  return {
    handleBlockUser,
    handleUnblockUser,
  };
};

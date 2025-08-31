import { FieldErrors } from 'react-hook-form';
import useModalStore from '@/store/modalStore';

export const useErrorModal = <T extends Record<string, any>>(
  errors: FieldErrors<T>,
) => {
  const { handleModalState } = useModalStore();

  const showErrorModal = (errorFields: (keyof T)[]) => {
    const firstError = errorFields.find((field) => errors[field]?.message);

    if (firstError && errors[firstError]?.message) {
      handleModalState({
        isShowModal: true,
        mainText: errors[firstError]?.message as string,
      });
    }
  };

  return { showErrorModal };
};

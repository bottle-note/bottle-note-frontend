import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import ReviewModify from '@/app/(primary)/review/modify/page';
import ReviewRegister from '@/app/(primary)/review/register/page';
import useModalStore from '@/store/modalStore';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('@/hooks/useSingleApiCall', () => ({
  useSingleApiCall: () => ({
    isProcessing: false,
    executeApiCall: jest.fn(),
  }),
}));

jest.mock('@/hooks/useKeyboardVisible', () => ({
  useKeyboardVisible: () => false,
}));

jest.mock('@/app/(primary)/review/hook/useAlcoholDetails', () => ({
  useAlcoholDetails: () => ({ alcoholData: null }),
}));

const showErrorModal = jest.fn();

jest.mock('@/hooks/useErrorModal', () => ({
  useErrorModal: () => ({ showErrorModal }),
}));

jest.mock('@/app/(primary)/review/hook/useReviewSubmission', () => ({
  useReviewSubmission: () => ({ submitReview: jest.fn() }),
}));

jest.mock('@/app/(primary)/review/hook/useReviewAutoSave', () => ({
  useReviewAutoSave: () => ({
    removeSavedReview: jest.fn(),
    isToastVisible: false,
    toastMessage: '',
  }),
}));

jest.mock('@/hooks/parseApiError', () => ({
  parseApiError: () => null,
}));

const mockReviewData = {
  alcoholInfo: { alcoholId: 1 },
  reviewInfo: {
    reviewContent: '기존 리뷰',
    status: 'PUBLIC',
    sizeType: null,
    price: null,
    tastingTagList: [],
    rating: 4,
    locationInfo: null,
  },
  reviewImageList: [],
};

jest.mock('@/queries/useReviewDetailQuery', () => ({
  useReviewDetailQuery: () => ({
    data: mockReviewData,
    error: null,
    isLoading: false,
    refetch: jest.fn(),
  }),
}));

jest.mock(
  '@/app/(primary)/review/_components/ReviewHeaderLayout',
  () =>
    function MockReviewHeaderLayout({ onBack }: { onBack: () => void }) {
      return <button onClick={onBack}>뒤로가기</button>;
    },
);

jest.mock('@/app/(primary)/review/_components/form/ReviewForm', () => {
  // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
  const { useFormContext } = require('react-hook-form');

  return function MockReviewForm() {
    const { setValue } = useFormContext();

    return (
      <button
        onClick={() => setValue('review', '변경된 리뷰', { shouldDirty: true })}
      >
        리뷰 내용 변경
      </button>
    );
  };
});

jest.mock(
  '@/app/(primary)/review/_components/AlcoholSearchBottomSheet',
  () =>
    function MockAlcoholSearchBottomSheet() {
      return null;
    },
);

jest.mock(
  '@/components/ui/Button/Button',
  () =>
    function MockButton() {
      return <button>리뷰 저장</button>;
    },
);

describe('ReviewModify 뒤로가기 확인 모달', () => {
  const routerBack = jest.fn();

  beforeEach(() => {
    routerBack.mockReset();
    showErrorModal.mockReset();
    useModalStore.getState().handleCloseModal();
    (useRouter as jest.Mock).mockReturnValue({ back: routerBack });
    (useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('reviewId=1'),
    );
  });

  const openBackConfirmation = () => {
    render(<ReviewModify />);
    fireEvent.click(screen.getByRole('button', { name: '리뷰 내용 변경' }));
    fireEvent.click(screen.getByRole('button', { name: '뒤로가기' }));

    return useModalStore.getState().state;
  };

  it('예를 선택하면 변경사항을 버리고 이전 화면으로 이동한다', () => {
    const modalState = openBackConfirmation();

    expect(modalState.isShowModal).toBe(true);
    act(() => modalState.handleConfirm?.());

    expect(routerBack).toHaveBeenCalledTimes(1);
    expect(useModalStore.getState().state.isShowModal).toBe(false);
  });

  it('아니요를 선택하면 모달만 닫고 수정 화면에 머문다', () => {
    const modalState = openBackConfirmation();

    act(() => modalState.handleCancel?.());

    expect(routerBack).not.toHaveBeenCalled();
    expect(useModalStore.getState().state.isShowModal).toBe(false);
  });
});

describe('ReviewRegister 뒤로가기 확인 모달', () => {
  const routerBack = jest.fn();

  beforeEach(() => {
    routerBack.mockReset();
    showErrorModal.mockReset();
    useModalStore.getState().handleCloseModal();
    (useRouter as jest.Mock).mockReturnValue({
      back: routerBack,
      replace: jest.fn(),
    });
    (useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('alcoholId=1'),
    );
  });

  const openBackConfirmation = () => {
    render(<ReviewRegister />);
    fireEvent.click(screen.getByRole('button', { name: '리뷰 내용 변경' }));
    fireEvent.click(screen.getByRole('button', { name: '뒤로가기' }));

    return useModalStore.getState().state;
  };

  it('예를 선택하면 작성 중인 리뷰를 버리고 이전 화면으로 이동한다', () => {
    const modalState = openBackConfirmation();

    expect(modalState.isShowModal).toBe(true);
    act(() => modalState.handleConfirm?.());

    expect(routerBack).toHaveBeenCalledTimes(1);
    expect(useModalStore.getState().state.isShowModal).toBe(false);
  });

  it('아니요를 선택하면 모달만 닫고 작성 화면에 머문다', () => {
    const modalState = openBackConfirmation();

    act(() => modalState.handleCancel?.());

    expect(routerBack).not.toHaveBeenCalled();
    expect(useModalStore.getState().state.isShowModal).toBe(false);
  });
});

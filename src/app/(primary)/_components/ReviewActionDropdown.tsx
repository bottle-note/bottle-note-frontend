import { useRouter } from 'next/navigation';
import OptionDropdown from '@/components/OptionDropdown';
import useModalStore from '@/store/modalStore';
import useRelationshipsStore from '@/store/relationshipsStore';
import { useBlockActions } from '@/hooks/useBlockActions';
import { deleteReview } from '@/lib/Review';
import { ROUTES } from '@/constants/routes';

interface ReviewActionDropdownProps {
  isShow: boolean;
  onClose: () => void;
  isOwnReview: boolean;
  reviewId: string;
  userId: string;
  userNickname: string;
  onRefresh?: () => void;
}

const ReviewActionDropdown = ({
  isShow,
  onClose,
  isOwnReview,
  reviewId,
  userId,
  userNickname,
  onRefresh,
}: ReviewActionDropdownProps) => {
  const router = useRouter();
  const { handleModalState } = useModalStore();
  const { isUserBlocked } = useRelationshipsStore();
  const { handleBlockUser } = useBlockActions();

  const handleCloseOption = () => {
    handleModalState({
      isShowModal: true,
      type: 'ALERT',
      mainText: '성공적으로 삭제되었습니다.',
      handleConfirm: () => {
        onClose();
        handleModalState({
          isShowModal: false,
          mainText: '',
        });
        if (onRefresh) {
          onRefresh();
        } else {
          router.back();
        }
      },
    });
  };

  const handleOptionSelect = (option: { name: string; type: string }) => {
    if (option.type === 'DELETE') {
      handleModalState({
        isShowModal: true,
        mainText: '정말 삭제하시겠습니까?',
        type: 'CONFIRM',
        handleConfirm: () => {
          deleteReview(reviewId, handleCloseOption);
        },
      });
    } else if (option.type === 'MODIFY') {
      router.push(ROUTES.REVIEW.MODIFY(reviewId));
    } else if (option.type === 'REVIEW_REPORT') {
      router.push(ROUTES.REPORT.REVIEW(reviewId));
    } else if (option.type === 'USER_REPORT') {
      router.push(ROUTES.REPORT.USER(userId));
    } else if (option.type === 'USER_BLOCK') {
      handleBlockUser(userId, userNickname);
    }
  };

  if (!isShow) return null;

  return (
    <OptionDropdown
      handleClose={onClose}
      options={
        isOwnReview
          ? [
              { name: '수정하기', type: 'MODIFY' },
              { name: '삭제하기', type: 'DELETE' },
            ]
          : [
              { name: '리뷰 신고', type: 'REVIEW_REPORT' },
              { name: '유저 신고', type: 'USER_REPORT' },
              ...(isUserBlocked(userId)
                ? []
                : [{ name: '유저 차단', type: 'USER_BLOCK' }]),
            ]
      }
      handleOptionSelect={handleOptionSelect}
      title={isOwnReview ? '내 리뷰' : '신고하기'}
    />
  );
};

export default ReviewActionDropdown;

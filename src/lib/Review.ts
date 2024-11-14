import { ReviewApi } from '@/app/api/ReviewApi';

export const deleteReview = async (
  reviewId: string | number,
  handleConfirm: () => void,
) => {
  if (!reviewId) return;

  try {
    const result = await ReviewApi.deleteReview(reviewId.toString());
    if (result) {
      handleConfirm();
    }
  } catch (error) {
    console.error('Failed to delete review:', error);
  }
};

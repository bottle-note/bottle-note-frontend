import { isPublicReview } from '@/shared/seo/reviewMetadata';
import { getReviewSeoData } from '@/shared/seo/seoData';
import ReviewDetailClient from './_components/ReviewDetailClient';

interface Props {
  params: { id: string };
}

export default async function ReviewDetailPage({ params }: Props) {
  const result = await getReviewSeoData(params.id);
  const publicReview =
    result.status === 'ok' && isPublicReview(result.data)
      ? result.data
      : undefined;

  return (
    <ReviewDetailClient
      key={params.id}
      reviewId={params.id}
      initialData={publicReview}
    />
  );
}

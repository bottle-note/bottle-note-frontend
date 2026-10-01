import { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import { generateReviewSchema } from '@/utils/seo/generateReviewSchema';
import {
  buildReviewMetadata,
  isPublicReview,
} from '@/shared/seo/reviewMetadata';
import { getReviewSeoData } from '@/shared/seo/seoData';

interface Props {
  params: { id: string };
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return buildReviewMetadata(params.id, await getReviewSeoData(params.id));
}

export default async function ReviewLayout({ params, children }: Props) {
  const result = await getReviewSeoData(params.id);
  const schema =
    result.status === 'ok' && isPublicReview(result.data)
      ? generateReviewSchema(result.data.alcoholInfo, result.data.reviewInfo)
      : null;

  return (
    <>
      {schema && <JsonLd data={schema} />}
      {children}
    </>
  );
}

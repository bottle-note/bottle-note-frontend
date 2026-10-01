import { Metadata } from 'next';
import NavLayout from '@/components/ui/Layout/NavLayout';
import { buildAlcoholReviewsMetadata } from '@/shared/seo/alcoholMetadata';
import { getAlcoholSeoData } from '@/shared/seo/seoData';

interface Props {
  params: { id: string };
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return buildAlcoholReviewsMetadata(
    params.id,
    await getAlcoholSeoData(params.id),
  );
}

export default function Layout({ children }: Props) {
  return <NavLayout showNavbar={false}>{children}</NavLayout>;
}

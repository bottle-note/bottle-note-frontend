import { Metadata } from 'next';
import { buildCurationMetadata } from '@/shared/seo/curationMetadata';
import { getCurationSeoData } from '@/shared/seo/seoData';

interface Props {
  params: { id: string };
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return buildCurationMetadata(params.id, await getCurationSeoData(params.id));
}

export default function Layout({ children }: Props) {
  return <>{children}</>;
}

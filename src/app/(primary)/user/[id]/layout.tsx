import { Metadata } from 'next';
import { getUserSeoData } from '@/shared/seo/seoData';
import { buildUserMetadata } from '@/shared/seo/userMetadata';

interface Props {
  params: { id: string };
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return buildUserMetadata(await getUserSeoData(params.id));
}

export default function Layout({ children }: Props) {
  return <>{children}</>;
}

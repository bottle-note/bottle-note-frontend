import type { Metadata } from 'next';
import { getImportClearanceAlcoholSeoData } from '@/shared/seo/seoData';
import { buildImportClearanceAlcoholMetadata } from './_lib/metadata';

interface Props {
  params: { id: string };
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return buildImportClearanceAlcoholMetadata(
    params.id,
    await getImportClearanceAlcoholSeoData(params.id),
  );
}

export default function ImportClearanceAlcoholLayout({ children }: Props) {
  return <>{children}</>;
}

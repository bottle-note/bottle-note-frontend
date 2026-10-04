import { getCurationSeoData } from '@/shared/seo/seoData';
import CurationDetailClient from './_components/CurationDetailClient';

interface Props {
  params: { id: string };
}

export default async function CurationDetailPage({ params }: Props) {
  const result = await getCurationSeoData(params.id);

  return (
    <CurationDetailClient
      curationId={params.id}
      initialData={result.status === 'ok' ? result.data : undefined}
    />
  );
}

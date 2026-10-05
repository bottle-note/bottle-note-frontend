import { getImportClearanceAlcoholSeoData } from '@/shared/seo/seoData';
import ImportClearanceDetailClient from './_components/ImportClearanceDetailClient';

interface Props {
  params: { id: string };
}

export default async function ImportClearanceDetailPage({ params }: Props) {
  const result = await getImportClearanceAlcoholSeoData(params.id);

  return (
    <ImportClearanceDetailClient
      key={params.id}
      id={params.id}
      initialData={result.status === 'ok' ? result.data : undefined}
    />
  );
}

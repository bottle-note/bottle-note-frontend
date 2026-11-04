import JsonLd from '@/components/seo/JsonLd';
import { getAlcoholSeoData } from '@/shared/seo/seoData';
import { generateAlcoholSchema } from '@/utils/seo/generateAlcoholSchema';
import AlcoholDetailPage from './_components/AlcoholDetailPage';

interface Props {
  params: { id: string };
}

// JSON-LD는 상세 페이지에만 둔다. layout에 두면 하위 리뷰 목록 페이지에도 함께 렌더링된다.
export default async function Page({ params }: Props) {
  const result = await getAlcoholSeoData(params.id);
  const alcohol = result.status === 'ok' ? result.data.alcohols : null;

  return (
    <>
      {alcohol && <JsonLd data={generateAlcoholSchema(alcohol)} />}
      <AlcoholDetailPage
        key={params.id}
        initialData={result.status === 'ok' ? result.data : undefined}
      />
    </>
  );
}

import JsonLd from '@/components/seo/JsonLd';
import { getAlcoholSeoData } from '@/shared/seo/seoData';
import {
  generateAlcoholPageSchema,
  generateAlcoholSchema,
} from '@/utils/seo/generateAlcoholSchema';
import AlcoholDetailPage from './_components/AlcoholDetailPage';
import { GUEST_GATED_CONTENT_CLASS } from './_constants';

interface Props {
  params: { id: string };
}

// JSON-LD는 상세 페이지에만 둔다. layout에 두면 하위 리뷰 목록 페이지에도 함께 렌더링된다.
export default async function Page({ params }: Props) {
  const result = await getAlcoholSeoData(params.id);
  const alcohol = result.status === 'ok' ? result.data.alcohols : null;

  return (
    <>
      {alcohol && (
        <>
          <JsonLd data={generateAlcoholSchema(alcohol)} />
          <JsonLd
            data={generateAlcoholPageSchema(
              alcohol,
              `.${GUEST_GATED_CONTENT_CLASS}`,
            )}
          />
        </>
      )}
      <AlcoholDetailPage
        key={params.id}
        initialData={result.status === 'ok' ? result.data : undefined}
      />
    </>
  );
}

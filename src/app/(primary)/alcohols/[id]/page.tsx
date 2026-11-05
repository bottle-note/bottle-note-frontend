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
        initialData={
          result.status === 'ok'
            ? // 하루 캐시된 응답이라 그 사이 지워지거나 비공개로 바뀐 리뷰가 섞일 수 있다.
              // 리뷰는 브라우저에서 새로 받은 응답으로만 그리므로 HTML에 싣지 않는다.
              { ...result.data, reviewInfo: { reviewList: [] } }
            : undefined
        }
      />
    </>
  );
}

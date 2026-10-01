import React from 'react';
import { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import { generateAlcoholSchema } from '@/utils/seo/generateAlcoholSchema';
import { buildAlcoholMetadata } from '@/shared/seo/alcoholMetadata';
import { getAlcoholSeoData } from '@/shared/seo/seoData';

interface Props {
  params: { id: string };
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return buildAlcoholMetadata(params.id, await getAlcoholSeoData(params.id));
}

export default async function Layout({ params, children }: Props) {
  const result = await getAlcoholSeoData(params.id);
  const schema =
    result.status === 'ok' && result.data.alcohols
      ? generateAlcoholSchema(
          result.data.alcohols,
          result.data.reviewInfo?.reviewList,
        )
      : null;

  return (
    <div className="min-h-screen relative">
      {schema && <JsonLd data={schema} />}
      {children}
    </div>
  );
}

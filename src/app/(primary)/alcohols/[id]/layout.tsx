import React from 'react';
import { Metadata } from 'next';
import { buildAlcoholMetadata } from '@/shared/seo/alcoholMetadata';
import { getAlcoholSeoData } from '@/shared/seo/seoData';

interface Props {
  params: { id: string };
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return buildAlcoholMetadata(params.id, await getAlcoholSeoData(params.id));
}

export default function Layout({ children }: Props) {
  return <div className="min-h-screen relative">{children}</div>;
}

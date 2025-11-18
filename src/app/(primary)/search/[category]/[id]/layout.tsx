import React from 'react';
import { Metadata } from 'next';
import { BASE_URL } from '@/constants/common';

export async function generateMetadata({
  params,
}: {
  params: { id: string; category: string };
}): Promise<Metadata> {
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

  try {
    if (!serverUrl) {
      throw new Error('NEXT_PUBLIC_SERVER_URL is not set');
    }

    const response = await fetch(`${serverUrl}/alcohols/${params.id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const result = await response.json();
    const alcoholData = result.data;

    if (!alcoholData?.alcohols) {
      return {
        title: '위스키 상세',
      };
    }

    const { alcohols } = alcoholData;
    const title = `${alcohols.korName || alcohols.engName} - 위스키 상세`;
    const description = `${alcohols.engDistillery || alcohols.korDistillery || ''} ${alcohols.engCategory || ''} 위스키. 평균 별점: ${alcohols.rating || 'N/A'}점. 테이스팅 노트와 리뷰를 확인하세요.`;

    return {
      title,
      description,
      keywords: [
        alcohols.korName,
        alcohols.engName,
        alcohols.engDistillery,
        alcohols.korDistillery,
        alcohols.engCategory,
        alcohols.korCategory,
        alcohols.korRegion,
        alcohols.engRegion,
        '위스키',
        '위스키 리뷰',
      ].filter(Boolean) as string[],
      openGraph: {
        title,
        description,
        url: `${BASE_URL}/search/${params.category}/${params.id}`,
        type: 'website',
        images: alcohols.alcoholUrlImg
          ? [
              {
                url: alcohols.alcoholUrlImg,
                width: 800,
                height: 600,
                alt: alcohols.korName || alcohols.engName,
              },
            ]
          : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: alcohols.alcoholUrlImg ? [alcohols.alcoholUrlImg] : undefined,
      },
    };
  } catch (error) {
    console.error('Failed to generate metadata:', error);
    return {
      title: '위스키 상세',
    };
  }
}

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="min-h-screen relative">{children}</div>;
}

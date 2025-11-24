import { Metadata } from 'next';

interface Props {
  params: { id: string };
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = params;
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

  try {
    if (!serverUrl) {
      throw new Error('NEXT_PUBLIC_SERVER_URL is not set');
    }

    const response = await fetch(`${serverUrl}/reviews/detail/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const result = await response.json();
    const reviewData = result.data;
    const { alcoholInfo, reviewInfo, reviewImageList } = reviewData;

    const title = `${alcoholInfo.korName} 리뷰 - ${reviewInfo.userInfo.nickName}님의 테이스팅 노트`;
    const description =
      reviewInfo.reviewContent.length > 150
        ? `${reviewInfo.reviewContent.substring(0, 150)}...`
        : reviewInfo.reviewContent;

    const imageUrl = reviewImageList?.[0]?.viewUrl || alcoholInfo.imageUrl;

    return {
      title,
      description,
      keywords: [
        alcoholInfo.korName,
        alcoholInfo.korName + ' 후기',
        alcoholInfo.korName + ' 리뷰',
        alcoholInfo.engName,
        alcoholInfo.engName + ' 후기',
        alcoholInfo.engName + ' 리뷰',
        '위스키 리뷰',
        '테이스팅 노트',
        '추천 위스키',
        alcoholInfo.korCategoryName,
        '보틀노트',
      ].filter(Boolean) as string[],
      alternates: {
        canonical: `/review/${id}`,
      },
      openGraph: {
        title,
        description,
        url: `/review/${id}`,
        type: 'article',
        publishedTime: reviewInfo.createAt,
        authors: [reviewInfo.userInfo.nickName],
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: `${alcoholInfo.korName} 리뷰 이미지`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
      },
    };
  } catch (error) {
    return {
      title: '위스키 리뷰',
      description: '위스키 테이스팅 노트를 확인하세요.',
    };
  }
}

export default function ReviewLayout({ children }: Props) {
  return <>{children}</>;
}

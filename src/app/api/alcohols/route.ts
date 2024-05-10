import { NextRequest, NextResponse } from 'next/server';

async function getPopular() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/popular/week`,
    );
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    const result = await response.json();
    if (result.data.totalCount !== 0) {
      const formattedData = result.data.alcohols.map((alcohol: any) => ({
        whiskyId: alcohol.whiskyId,
        korName: alcohol.korName,
        engName: alcohol.engName,
        rating: alcohol.rating,
        engCategory: alcohol.engCategory,
        imageUrl: alcohol.imageUrl,
        path: `/search/${alcohol.whiskyId}`,
      }));
      return NextResponse.json(formattedData);
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Error fetching data' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { search } = new URL(request.url);

  switch (search) {
    case '?popular':
      return getPopular();

    default:
  }
}

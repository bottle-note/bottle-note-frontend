import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, res: NextResponse) {
  return NextResponse.json(res, { status: 200 });
}

import { NextResponse } from 'next/server';

type AsyncFn = () => Promise<any>;

export async function apiWrapper(fn: AsyncFn) {
  try {
    const res = await fn();
    return res;
  } catch (_e) {
    const error = _e as Error;
    console.error(error.message, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

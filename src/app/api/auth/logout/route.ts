import { createLogoutResponse } from '@/lib/auth/server';

export async function POST() {
  return createLogoutResponse();
}

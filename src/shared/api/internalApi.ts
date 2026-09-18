function ticketFrom(raw: string | undefined): string | null {
  if (!raw) return null;

  try {
    return new URL(raw).searchParams.get('warpgate-ticket');
  } catch {
    return null;
  }
}

function getLocalWarpTicket(): string | null {
  return (
    ticketFrom(process.env.API_SERVER_WARP_URL) ??
    ticketFrom(process.env.INTERNAL_SERVER_URL)
  );
}

/** 로컬은 API_SERVER_WARP_URL origin, 클러스터는 INTERNAL_SERVER_URL origin. */
export function getInternalServerOrigin(): string {
  const raw =
    process.env.API_SERVER_WARP_URL || process.env.INTERNAL_SERVER_URL;
  if (!raw) {
    throw new Error('INTERNAL_SERVER_URL is required');
  }

  return new URL(raw).origin;
}

/** 서버에서 product-api 를 칠 때 쓰는 헤더. 로컬 티켓이 없으면 받은 헤더 그대로다. */
export function internalApiHeaders(
  headers: Record<string, string> = {},
): Record<string, string> {
  const ticket = getLocalWarpTicket();
  if (!ticket || headers.Authorization || headers.authorization) {
    return headers;
  }

  return {
    ...headers,
    Authorization: `Warpgate ${ticket}`,
  };
}

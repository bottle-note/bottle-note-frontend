import { apiClient } from '@/shared/api/apiClient';

export type CampaignCode =
  | 'whiskey-mbti'
  | 'whiskey-tarot'
  | 'bartender-note-recommend'
  | 'bartender-note-review'
  | 'bartender-note-curation';
export type CampaignEventType = 'VIEW' | 'START' | 'FINISH' | 'RESULT';

// Serializing requests lets the initial VIEW response establish the visitor
// cookie before a quick START is sent. The visitor cookie is shared by every
// campaign code, so one queue serves all codes: a page that sends several VIEWs
// at once (bartender note) still lands them on the same visitor. Nothing in the
// UI waits for this queue.
let pending: Promise<void> | null = null;

async function sendEvent(code: CampaignCode, type: CampaignEventType) {
  const endpoint = `/campaign-contents/${code}/events`;
  if (type === 'RESULT') {
    await apiClient.post(
      endpoint,
      { type },
      { authRequired: true, keepalive: true },
    );
    return;
  }

  // apiClient adds a session token even with authRequired: false. These events
  // must also work for guests and must not fail because of a stale token.
  const response = await fetch(`/bottle-api/v1${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type }),
    credentials: 'same-origin',
    keepalive: true,
  });
  if (!response.ok) throw new Error('Campaign event rejected');
}

export function trackCampaignEvent(
  code: CampaignCode,
  type: CampaignEventType,
): void {
  const next = pending
    ? pending.then(() => sendEvent(code, type))
    : sendEvent(code, type);
  pending = next.catch(() => {});
}

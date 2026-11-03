import { beforeEach, describe, expect, it, vi } from 'vitest';

const { post } = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock('@/shared/api/apiClient', () => ({ apiClient: { post } }));

describe('campaign content events', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
    post.mockResolvedValue({ success: true });
  });

  it('sends anonymous VIEW first and sequences START behind its cookie response without blocking the caller', async () => {
    let resolveView!: (response: Response) => void;
    vi.mocked(fetch).mockReturnValueOnce(
      new Promise<Response>((resolve) => {
        resolveView = resolve;
      }),
    );
    const { trackCampaignEvent } = await import('./campaign-content.api');

    expect(trackCampaignEvent('whiskey-mbti', 'VIEW')).toBeUndefined();
    expect(trackCampaignEvent('whiskey-mbti', 'START')).toBeUndefined();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      '/bottle-api/v1/campaign-contents/whiskey-mbti/events',
      expect.objectContaining({
        method: 'POST',
        credentials: 'same-origin',
        keepalive: true,
        body: JSON.stringify({ type: 'VIEW' }),
      }),
    );
    expect(post).not.toHaveBeenCalled();

    resolveView({ ok: true } as Response);
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    expect(vi.mocked(fetch).mock.calls[1][1]?.body).toBe(
      JSON.stringify({ type: 'START' }),
    );
  });

  it('sequences events across campaign codes so later codes reuse the first visitor cookie', async () => {
    let resolveView!: (response: Response) => void;
    vi.mocked(fetch).mockReturnValueOnce(
      new Promise<Response>((resolve) => {
        resolveView = resolve;
      }),
    );
    const { trackCampaignEvent } = await import('./campaign-content.api');

    trackCampaignEvent('bartender-note-recommend', 'VIEW');
    trackCampaignEvent('bartender-note-curation', 'VIEW');
    trackCampaignEvent('bartender-note-review', 'VIEW');
    expect(fetch).toHaveBeenCalledTimes(1);

    resolveView({ ok: true } as Response);
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));
    expect(vi.mocked(fetch).mock.calls.map(([url]) => url)).toEqual([
      '/bottle-api/v1/campaign-contents/bartender-note-recommend/events',
      '/bottle-api/v1/campaign-contents/bartender-note-curation/events',
      '/bottle-api/v1/campaign-contents/bartender-note-review/events',
    ]);
  });

  it('failed events do not throw or prevent later events', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('offline'));
    const { trackCampaignEvent } = await import('./campaign-content.api');
    trackCampaignEvent('whiskey-tarot', 'VIEW');
    trackCampaignEvent('whiskey-tarot', 'FINISH');
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
  });

  it('sends RESULT through the authenticated API client', async () => {
    const { trackCampaignEvent } = await import('./campaign-content.api');
    trackCampaignEvent('whiskey-tarot', 'RESULT');
    await vi.waitFor(() => expect(post).toHaveBeenCalledTimes(1));
    expect(post).toHaveBeenCalledWith(
      '/campaign-contents/whiskey-tarot/events',
      { type: 'RESULT' },
      expect.objectContaining({ authRequired: true, keepalive: true }),
    );
    expect(fetch).not.toHaveBeenCalled();
  });
});

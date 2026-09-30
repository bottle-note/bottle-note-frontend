import { BOTTLES, CURATIONS, type Bottle } from '../_lib/experience';

/** UX preview only. Replace at the query boundary once the API contract exists. */
export function loadPreviewRecommendations(
  signal: AbortSignal,
  curationId?: string,
): Promise<Bottle[]> {
  return new Promise((resolve, reject) => {
    const abort = () => {
      window.clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    };
    const timer = window.setTimeout(() => {
      signal.removeEventListener('abort', abort);
      const curation = CURATIONS.find((item) => item.id === curationId);
      resolve(
        curation
          ? curation.ids
              .map((id) => BOTTLES.find((bottle) => bottle.id === id)!)
              .filter(Boolean)
          : BOTTLES.slice(0, 10),
      );
    }, 700);
    if (signal.aborted) abort();
    else signal.addEventListener('abort', abort, { once: true });
  });
}

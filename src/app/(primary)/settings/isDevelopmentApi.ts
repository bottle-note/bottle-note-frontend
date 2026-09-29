export function isDevelopmentApi(serverUrl: string | undefined): boolean {
  if (!serverUrl) return false;

  try {
    return new URL(serverUrl).hostname === 'api.development.bottle-note.com';
  } catch {
    return false;
  }
}

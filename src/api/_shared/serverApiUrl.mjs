/**
 * 서버 주소는 환경변수로, API 버전은 호출하는 서비스에서 관리한다.
 * 기존 환경값의 /api/v1 경로도 허용하도록 origin만 사용한다.
 * @param {'v1' | 'v2'} version
 */
export function getServerApiUrl(version) {
  const serverUrl = process.env.INTERNAL_SERVER_URL;
  if (!serverUrl) {
    throw new Error('INTERNAL_SERVER_URL is required');
  }

  return `${new URL(serverUrl).origin}/api/${version}`;
}

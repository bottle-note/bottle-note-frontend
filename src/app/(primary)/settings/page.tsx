import SettingsClient from './SettingsClient';
import { isDevelopmentApi } from './isDevelopmentApi';

// Read the deployment's API environment for each request, not from the client build.
export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  const serverUrlKey = 'NEXT_PUBLIC_SERVER_URL';
  return (
    <SettingsClient
      showNotificationSettings={isDevelopmentApi(process.env[serverUrlKey])}
    />
  );
}

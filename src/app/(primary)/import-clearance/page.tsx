'use client';

import { useSearchParams } from 'next/navigation';
import ImportClearanceList from './_components/ImportClearanceList';
import ImporterList from './_components/ImporterList';

export default function ImportClearancePage() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');

  return tab === 'importer' ? <ImporterList /> : <ImportClearanceList />;
}

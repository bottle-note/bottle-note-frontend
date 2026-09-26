import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import type { MfdsAlcoholListItem } from '@/api/mfds/types';
import { formatDate } from '@/utils/formatDate';
import { trackGA4Event } from '@/utils/analytics/ga4';
import { declarationName } from '../_lib/declaration';

interface Props {
  item: MfdsAlcoholListItem;
}

export default function ImportClearanceCompactItem({ item }: Props) {
  const { korName } = declarationName(item);
  const meta = [item.importerBaseName, item.exportCountryNameKo].filter(
    Boolean,
  );
  const processedDateLabel = item.processedDate
    ? (formatDate(item.processedDate, 'FULL_DATE') as string)
    : '통관일자 미상';

  return (
    <Link
      href={ROUTES.IMPORT_CLEARANCE.DETAIL(item.id)}
      className="flex items-center justify-between gap-12 border-b border-stroke-neutral-subtle py-12 last:border-b-0"
      onClick={() =>
        trackGA4Event('select_import_clearance', {
          declaration_id: String(item.id),
          source: 'related',
        })
      }
    >
      <div className="min-w-0">
        <p className="truncate text-13 text-fg-neutral">{korName}</p>
        {meta.length > 0 && (
          <p className="mt-2 truncate text-11 text-fg-neutral-muted">
            {meta.join(' · ')}
          </p>
        )}
      </div>
      <span className="flex shrink-0 items-center gap-4 text-12 text-fg-brand">
        {processedDateLabel}
        <ChevronRight
          size={14}
          className="text-fg-neutral-subtle"
          aria-hidden
        />
      </span>
    </Link>
  );
}

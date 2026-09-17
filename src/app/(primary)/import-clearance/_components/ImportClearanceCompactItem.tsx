import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import type { MfdsAlcoholListItem } from '@/api/mfds/types';
import { declarationName } from '../_lib/declaration';

interface Props {
  item: MfdsAlcoholListItem;
}

export default function ImportClearanceCompactItem({ item }: Props) {
  const { korName } = declarationName(item);
  const meta = [item.importerBaseName, item.exportCountryNameKo].filter(
    Boolean,
  );

  return (
    <Link
      href={ROUTES.IMPORT_CLEARANCE.DETAIL(item.id)}
      className="flex items-center justify-between gap-3 border-b border-stroke-neutral-subtle py-3"
    >
      <div className="min-w-0">
        <p className="truncate text-13 text-fg-neutral">{korName}</p>
        {meta.length > 0 && (
          <p className="mt-0.5 truncate text-11 text-fg-neutral-muted">
            {meta.join(' · ')}
          </p>
        )}
      </div>
      <span className="shrink-0 text-12 text-fg-brand">
        {item.processedDate ?? '처리일자 미상'}
      </span>
    </Link>
  );
}

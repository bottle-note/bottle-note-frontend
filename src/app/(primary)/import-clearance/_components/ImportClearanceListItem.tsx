import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import List from '@/components/feature/List/List';
import ItemInfo from '@/components/feature/List/_components/ItemInfo';
import { ROUTES } from '@/constants/routes';
import type { MfdsAlcoholListItem } from '@/api/mfds/types';
import { formatDate } from '@/utils/formatDate';
import { trackGA4Event } from '@/utils/analytics/ga4';
import { declarationName } from '../_lib/declaration';

interface Props {
  item: MfdsAlcoholListItem;
}

export default function ImportClearanceListItem({ item }: Props) {
  const { korName, engName } = declarationName(item);
  const hasTags = Boolean(item.alcoholCategoryKo || item.exportCountryNameKo);
  const processedDateLabel = item.processedDate
    ? (formatDate(item.processedDate, 'FULL_DATE') as string)
    : '통관일자 미상';

  return (
    <Link
      href={ROUTES.IMPORT_CLEARANCE.ALCOHOL(item.id)}
      className="block"
      onClick={() =>
        trackGA4Event('select_import_clearance', {
          declaration_id: String(item.id),
          source: 'list',
        })
      }
    >
      <List.ItemLayout className="justify-between gap-8 px-0 py-12">
        <div className="min-w-0 flex-1">
          {hasTags && (
            <div className="mb-6 flex flex-wrap items-center gap-4">
              {item.alcoholCategoryKo && (
                <span className="label-default whitespace-nowrap px-8 text-10">
                  {item.alcoholCategoryKo}
                </span>
              )}
              {item.exportCountryNameKo && (
                <span className="whitespace-nowrap rounded-md border border-stroke-neutral-subtle bg-bg-neutral-weak px-8 py-4 text-10 text-fg-neutral-muted">
                  {item.exportCountryNameKo}
                </span>
              )}
            </div>
          )}
          <ItemInfo korName={korName} engName={engName} length={null} />
          <p className="mt-6 text-13 text-fg-neutral">
            <span className="mr-4 text-fg-neutral-muted">수입사</span>
            {item.importerBaseName ?? '수입사 미상'}
            <span className="text-fg-neutral-muted">
              {' '}
              · {processedDateLabel}
            </span>
          </p>
        </div>
        <ChevronRight
          size={18}
          className="shrink-0 text-fg-neutral-subtle"
          aria-hidden
        />
      </List.ItemLayout>
    </Link>
  );
}

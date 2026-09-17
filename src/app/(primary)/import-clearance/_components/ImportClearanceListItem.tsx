import Link from 'next/link';
import List from '@/components/feature/List/List';
import ItemInfo from '@/components/feature/List/_components/ItemInfo';
import { ROUTES } from '@/constants/routes';
import type { MfdsAlcoholListItem } from '@/api/mfds/types';
import { declarationName, processedDateText } from '../_lib/declaration';

interface Props {
  item: MfdsAlcoholListItem;
}

export default function ImportClearanceListItem({ item }: Props) {
  const { korName, engName } = declarationName(item);
  const meta = [
    item.importerBaseName,
    item.exportCountryNameKo,
    item.alcoholCategoryKo,
  ].filter(Boolean);

  return (
    <Link href={ROUTES.IMPORT_CLEARANCE.DETAIL(item.id)} className="block">
      <List.ItemLayout className="flex-col items-start px-0">
        <p className="text-12 text-fg-brand">
          처리일자 {processedDateText(item.processedDate)}
        </p>
        <div className="mt-1 w-full">
          <ItemInfo korName={korName} engName={engName} length={null} />
        </div>
        {meta.length > 0 && (
          <p className="mt-1 text-12 text-fg-neutral-muted">
            {meta.join(' · ')}
          </p>
        )}
      </List.ItemLayout>
    </Link>
  );
}

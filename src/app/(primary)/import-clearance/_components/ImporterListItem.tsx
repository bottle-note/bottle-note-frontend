import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import List from '@/components/feature/List/List';
import { ROUTES } from '@/constants/routes';
import type { MfdsImporter } from '@/api/mfds/types';

interface Props {
  item: MfdsImporter;
}

export default function ImporterListItem({ item }: Props) {
  return (
    <Link href={ROUTES.IMPORT_CLEARANCE.IMPORTER(item.id)} className="block">
      <List.ItemLayout className="justify-between gap-2 px-0 py-3">
        <div className="min-w-0 flex-1">
          <article className="flex flex-col space-y-1">
            <h2 className="line-clamp-2 text-15 font-bold leading-[1.3] text-fg-neutral">
              {item.businessName ?? '수입사명 미상'}
            </h2>
            {item.industryName && (
              <p className="text-13 text-fg-neutral-muted">
                <span>{item.industryName}</span>
              </p>
            )}
          </article>
          {item.primaryAddress && (
            <p className="mt-1.5 line-clamp-2 text-12 text-fg-neutral-muted">
              <span>{item.primaryAddress}</span>
            </p>
          )}
          {item.representativeName && (
            <p className="mt-1 text-13 text-fg-neutral-muted">
              <span>대표</span>
              <span className="ml-1 text-fg-neutral">
                {item.representativeName}
              </span>
            </p>
          )}
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

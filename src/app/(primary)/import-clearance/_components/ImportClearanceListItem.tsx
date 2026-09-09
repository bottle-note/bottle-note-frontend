import List from '@/components/feature/List/List';
import ItemInfo from '@/components/feature/List/_components/ItemInfo';

export interface ImportClearanceItem {
  id: string;
  clearanceDate: string;
  korName: string;
  engName: string;
  importerName: string;
  exportCountry: string;
  category: string;
  alcoholId: number | null;
  imageUrl?: string;
}

interface Props {
  item: ImportClearanceItem;
}

export default function ImportClearanceListItem({ item }: Props) {
  return (
    <List.ItemLayout className="gap-3 px-0">
      {item.imageUrl && (
        <List.ItemImage
          src={item.imageUrl}
          alt={`${item.korName} 이미지`}
          size="sm"
          className="rounded-sm"
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-12 text-fg-brand">통관일 {item.clearanceDate}</p>
        <div className="mt-1">
          <ItemInfo
            korName={item.korName}
            engName={item.engName}
            length={null}
          />
        </div>
        <p className="mt-1 text-12 text-fg-neutral-muted">
          {item.importerName} · {item.exportCountry} · {item.category}
        </p>
      </div>
    </List.ItemLayout>
  );
}

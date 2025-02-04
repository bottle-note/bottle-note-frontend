import Image from 'next/image';
import Link from 'next/link';
import { formatDate } from '@/utils/formatDate';
import Badge from '../Badge';

interface Props {
  title: string;
  date: string;
  id: number;
  hrefUrl: string;
  type?: 'WAITING' | 'SUCCESS' | 'REJECT' | 'DELETED';
}

function BoardListItem({ title, date, id, hrefUrl, type }: Props) {
  return (
    <Link
      className="border-b py-1 flex items-center justify-between"
      key={id}
      href={hrefUrl}
    >
      <div>
        {type && <Badge type={type} />}
        <p className="text-15 font-semiBold text-mainDarkGray">{title}</p>
        <p className="text-9 text-mainGray font-light">
          {formatDate(date) as string}
        </p>
      </div>
      <button>
        <Image
          src="/icon/arrow-right-subCoral.svg"
          alt={title}
          width={16}
          height={16}
        />
      </button>
    </Link>
  );
}

export default BoardListItem;

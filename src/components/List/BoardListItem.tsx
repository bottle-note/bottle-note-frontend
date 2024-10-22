import Image from 'next/image';
import Link from 'next/link';
import Badge from '../Badge';
import { formatDate } from '@/utils/formatDate';

interface Props {
  title: string;
  date: string;
  id: number;
  type?: 'WAITING' | 'SUCCESS' | 'REJECT' | 'DELETED';
}

function BoardListItem({ title, date, id, type }: Props) {
  return (
    <Link
      className="border-b py-1 flex items-center justify-between"
      key={id}
      href={`/announcement/${id}`}
    >
      <div>
        {type && <Badge type={type} />}
        <p className="text-15 font-semiBold text-mainDarkGray">{title}</p>
        <p className="text-9 text-mainGray font-light">{formatDate(date)}</p>
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

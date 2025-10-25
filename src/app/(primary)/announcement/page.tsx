'use client';

import Image from 'next/image';
import Link from 'next/link';
import List from '@/components/feature/List/List';
import { ROUTES } from '@/constants/routes';

function AccnouncementPage() {
  const MOCK_DATA = [
    { title: '정기 업데이트 알림', date: '2024. 04. 01', id: 1 },
    { title: '정기 업데이트 알림2', date: '2024. 04. 01', id: 2 },
    { title: '정기 업데이트 알림3', date: '2024. 04. 01', id: 3 },
  ];

  return (
    <List emptyViewText="공지사항이 없습니다.">
      <List.Total total={MOCK_DATA.length} />
      <List.Section>
        {MOCK_DATA.map((item) => (
          <Link
            className="border-b py-3 flex items-center justify-between"
            key={item.id}
            href={ROUTES.ANNOUNCEMENT.DETAIL(item.id)}
          >
            <div>
              <p className="text-15 font-bold text-mainDarkGray">
                {item.title}
              </p>
              <p className="text-9 text-mainGray font-light">{item.date}</p>
            </div>
            <button>
              <Image
                src="/icon/arrow-right-subCoral.svg"
                alt={item.title}
                width={16}
                height={16}
              />
            </button>
          </Link>
        ))}
      </List.Section>
    </List>
  );
}

export default AccnouncementPage;

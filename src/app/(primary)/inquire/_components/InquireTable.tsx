import { format } from 'date-fns';
import { InquireList } from '@/types/Inquire';
import { truncStr } from '@/utils/truncStr';
import { getStatusText } from '@/constants/Inquire';

interface InquireTableProps {
  inquireList: InquireList[];
  onItemClick: (helpId: number) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'WAITING':
      return 'text-fg-neutral-muted';
    case 'SUCCESS':
      return 'text-fg-brand';
    case 'REJECT':
      return 'text-fg-neutral-muted';
    case 'DELETED':
      return 'text-fg-neutral-muted';
    default:
      return 'text-fg-neutral-muted';
  }
};

export default function InquireTable({
  inquireList,
  onItemClick,
}: InquireTableProps) {
  return (
    <div className="w-full overflow-x-auto border-b border-stroke-neutral-subtle">
      <table className="w-full border-collapse">
        <thead>
          <tr className="font-bold text-13 text-fg-neutral">
            <th className="text-left py-[17px] px-4 ">문의 제목</th>
            <th className="text-left py-[17px] px-4">등록일</th>
            <th className="text-left py-[17px] px-4">답변</th>
          </tr>
        </thead>
        <tbody>
          {inquireList.map((item) => (
            <tr
              key={item.id}
              onClick={() => onItemClick(item.id)}
              className="border-t border-stroke-neutral-subtle hover:bg-bg-layer-default-pressed cursor-pointer transition-colors"
            >
              <td className="py-[15px] px-4 text-13 text-fg-neutral">
                <div className="text-fg-neutral line-clamp-2 break-words">
                  {item.title && truncStr(item.title, 20)}
                </div>
              </td>
              <td className="py-[15px] px-4 text-13 text-fg-neutral whitespace-nowrap">
                {format(new Date(item.createAt), 'yyyy.MM.dd')}
              </td>
              <td className="py-[15px] px-4">
                <span className={`text-13 ${getStatusColor(item.status)}`}>
                  {getStatusText(item.status)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

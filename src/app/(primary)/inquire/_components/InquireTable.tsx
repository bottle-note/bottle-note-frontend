import { format } from 'date-fns';
import { InquireList } from '@/types/Inquire';
import { truncStr } from '@/utils/truncStr';

interface InquireTableProps {
  inquireList: InquireList[];
  onItemClick: (helpId: number) => void;
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'WAITING':
      return '대기';
    case 'SUCCESS':
      return '답변완료';
    case 'REJECT':
      return '반려';
    case 'DELETED':
      return '삭제';
    default:
      return status;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'WAITING':
      return 'text-brightGray';
    case 'SUCCESS':
      return 'text-subCoral';
    case 'REJECT':
      return 'text-brightGray';
    case 'DELETED':
      return 'text-brightGray';
    default:
      return 'text-brightGray';
  }
};

export default function InquireTable({
  inquireList,
  onItemClick,
}: InquireTableProps) {
  return (
    <div className="w-full overflow-x-auto border-b border-brightGray">
      <table className="w-full border-collapse">
        <thead>
          <tr className="font-bold text-13 text-mainBlack">
            <th className="text-left py-[17px] px-4 ">문의 제목</th>
            <th className="text-left py-[17px] px-4">등록일</th>
            <th className="text-left py-[17px] px-4">답변</th>
          </tr>
        </thead>
        <tbody>
          {inquireList.map((item) => (
            <tr
              key={item.helpId}
              onClick={() => onItemClick(item.helpId)}
              className="border-t border-bgGray hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <td className="py-[15px] px-4 text-13 text-mainBlack">
                <div className="text-gray-900 line-clamp-2 break-words">
                  {item.title && truncStr(item.title, 20)}
                </div>
              </td>
              <td className="py-[15px] px-4 text-13 text-mainBlack whitespace-nowrap">
                {format(new Date(item.createAt), 'yyyy.MM.dd')}
              </td>
              <td className="py-[15px] px-4">
                <span className={`text-13 ${getStatusColor(item.helpStatus)}`}>
                  {getStatusText(item.helpStatus)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

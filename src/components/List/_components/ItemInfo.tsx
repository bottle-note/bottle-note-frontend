import { truncStr } from '@/utils/truncStr';

interface Props {
  korName: string;
  engName: string;
  korCategory: string;
  engCategory?: string;
}

const ItemInfo = ({ korName, engName, korCategory, engCategory }: Props) => (
  <article className="flex flex-col space-y-2">
    <h2 className="text-sm leading-sm font-bold line">{korName}</h2>
    <p className="text-10">
      <span>{truncStr(engName.toUpperCase(), 20)}</span>
      <span> · {korCategory}</span>
      {engCategory && <span> · {engCategory}</span>}
    </p>
  </article>
);

export default ItemInfo;

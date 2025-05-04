import { truncStr } from '@/utils/truncStr';

interface Props {
  korName: string;
  engName: string;
  korCategory: string;
}

const ItemInfo = ({ korName, engName, korCategory }: Props) => (
  <article className="flex flex-col space-y-1">
    <h2 className="text-sm leading-sm font-bold text-mainDarkGray">
      {truncStr(korName, 15)}
    </h2>
    <p className="text-10 text-mainDarkGray">
      <span>{truncStr(engName.toUpperCase(), 15)}</span>
      <span> · {korCategory}</span>
    </p>
  </article>
);

export default ItemInfo;

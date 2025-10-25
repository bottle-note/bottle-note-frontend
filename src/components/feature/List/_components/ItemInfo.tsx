import { truncStr } from '@/utils/truncStr';

interface Props {
  korName: string;
  engName: string;
  length?: number;
  korCategory?: string;
}

const ItemInfo = ({ korName, engName, korCategory, length }: Props) => {
  return (
    <article className="flex flex-col space-y-1">
      <h2 className="text-15 leading-sm font-bold text-mainDarkGray">
        {truncStr(korName, 15)}
      </h2>
      <p className="text-13 text-mainDarkGray">
        <span>{truncStr(engName.toUpperCase(), length ? length : 10)}</span>
        {korCategory && <span> · {korCategory}</span>}
      </p>
    </article>
  );
};

export default ItemInfo;

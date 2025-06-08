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
      <h2 className="text-sm leading-sm font-bold text-mainDarkGray">
        {truncStr(korName, 15)}
      </h2>
      <p className="text-10 text-mainDarkGray">
        <span>{truncStr(engName.toUpperCase(), length ? length : 15)}</span>
        {korCategory && <span> · {korCategory}</span>}
      </p>
    </article>
  );
};

export default ItemInfo;

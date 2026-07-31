import { truncStr } from '@/utils/truncStr';

interface Props {
  korName: string;
  engName: string;
  length?: number | null;
  korCategory?: string;
}

const ItemInfo = ({ korName, engName, korCategory, length }: Props) => {
  const engNameText =
    length === null
      ? engName.toUpperCase()
      : truncStr(engName.toUpperCase(), length ?? 13);

  return (
    <article className="flex flex-col space-y-1">
      <h2 className="line-clamp-2 text-15 font-bold leading-[1.3] text-fg-neutral">
        {korName}
      </h2>
      <p className="text-13 text-fg-neutral-muted">
        <span>{engNameText}</span>
        {korCategory && <span> · {korCategory}</span>}
      </p>
    </article>
  );
};

export default ItemInfo;

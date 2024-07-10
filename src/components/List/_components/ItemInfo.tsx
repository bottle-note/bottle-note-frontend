interface Props {
  korName: string;
  engName: string;
  korCategory: string;
  engCategory?: string;
}

const ItemInfo = ({ korName, engName, korCategory, engCategory }: Props) => (
  <article className="flex flex-col">
    <h2 className="whitespace-pre text-sm leading-sm font-bold line">
      {korName}
    </h2>
    <p className="text-xxs">
      <span>{engName}</span>
      <span> · {korCategory}</span>
      {engCategory && <span> · {engCategory}</span>}
    </p>
  </article>
);

export default ItemInfo;

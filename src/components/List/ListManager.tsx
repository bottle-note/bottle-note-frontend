import { filterChildComponent } from '@/utils/filterChildComponent';
import Total from './Total';

interface Props {
  children: React.ReactNode;
}

const ListManagerMain = ({ children }: Props) => {
  const totalDisplay = filterChildComponent(children, Total);

  return (
    <article className="flex justify-between items-center text-mainGray text-sm pb-3.24 border-mainBlack border-b">
      {totalDisplay}
    </article>
  );
};

const ListManager = Object.assign(ListManagerMain, {
  Total,
});

export default ListManager;

import Image from 'next/image';
import Star from '@/components/Star';
import whiskey from 'public/whiskey_img1.png';
import LikeBtn from '../app/(primary)/user/[id]/_components/LikeBtn';

const ListItem = () => {
  return (
    <article className="flex items-center space-x-4 text-mainBlack border-mainBlack border-b">
      <Image src={whiskey} alt="위스키 이미지" width={82} />

      <section className="flex-1">
        <article className="flex justify-between items-center">
          <h2 className="whitespace-pre text-[0.938rem] leading-[0.938rem] font-bold line">{`GLENDRONACH\nORIGINAL 12YEAR`}</h2>
          <div className="flex flex-col">
            {/* rating이 null 혹은 0인 경우 invisible */}
            <Star rating={3.5} />
            <span className="text-[0.625rem] justify-self-end row-start-2 text-right">
              (16)
            </span>
          </div>
        </article>

        <article className="flex justify-between">
          <p className="text-[0.688rem]">
            <span className="font-semibold">글렌스로낙 12Y</span>
            <span> · 싱글몰트 위스키</span>
          </p>
          <LikeBtn />
        </article>
      </section>
    </article>
  );
};

export default ListItem;

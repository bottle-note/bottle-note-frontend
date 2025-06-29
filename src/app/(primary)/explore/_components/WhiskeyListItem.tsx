import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ROUTES } from '@/constants/routes';
import { ExploreAlcohol } from '@/types/Explore';
import ItemImage from '@/components/List/_components/ItemImage';
import ItemInfo from '@/components/List/_components/ItemInfo';
import { addNewLine } from '@/utils/addNewLine';
import Star from '@/components/Star';
import { ItemStats } from '@/components/List/_components/ItemStats';
import Label from '../../_components/Label';

interface Props {
  content: ExploreAlcohol;
}

const WhiskeyListItem = ({ content }: Props) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [visibleTags, setVisibleTags] = useState<string[]>(
    content.alcoholsTastingTags,
  );

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible: string[] = [];

        entries.forEach((entry) => {
          const tag = entry.target.getAttribute('data-tag');
          if (entry.isIntersecting && tag) {
            visible.push(tag);
          }
        });

        const orderedVisible = content.alcoholsTastingTags.filter((tag) =>
          visible.includes(tag),
        );

        setVisibleTags(orderedVisible);
      },
      {
        root: section,
        rootMargin: '0px -10% 0px 0px',
        threshold: 1.0,
      },
    );

    setTimeout(() => {
      const tagElements = section.querySelectorAll('[data-tag]');
      tagElements.forEach((el) => observer.observe(el));
    }, 0);

    return () => observer.disconnect();
  }, [content.alcoholsTastingTags]);

  return (
    <section
      ref={sectionRef}
      className="flex items-center text-mainBlack py-6 w-full overflow-hidden"
    >
      {/* image */}
      <Link href={ROUTES.SEARCH.ALL(content.alcoholId)}>
        <ItemImage
          src={content.alcoholUrlImg}
          alt="image"
          className="w-[95px] h-[128px]"
        />
      </Link>

      {/* info */}
      <Link
        href={ROUTES.SEARCH.ALL(content.alcoholId)}
        className="flex flex-col items-start justify-center space-y-1"
      >
        <div>
          <ItemInfo
            korName={addNewLine(content.korName)}
            engName={content.engName}
            length={50}
          />
          <p className="text-10 text-mainDarkGray">{`도수 ${content.abv}% · ${content.korCategory}`}</p>
        </div>

        {/* 별점 */}
        <div className="flex items-center gap-x-1">
          <Label
            name="나의 별점"
            styleClass="label-default text-10 px-2 py-[1px] rounded-[2px] flex items-end"
            position="after"
            icon={
              <div className="pt-[2px]">
                <Star
                  rating={content.myRating}
                  size={11}
                  textStyle="text-12 font-semibold ml-[1px]"
                />
              </div>
            }
          />
          <div className="text-mainGray">
            <ItemStats
              iconSrc="/icon/star-filled-maingray.svg"
              pointContent={content.rating.toFixed(1)}
              countContent={content.totalRatingsCount.toString()}
              subTextClass="ml-[2px]"
            />
          </div>
        </div>

        {/*  태그 */}
        <div className="flex gap-x-1 w-full overflow-hidden">
          {visibleTags.map((tag) => (
            <div
              key={tag}
              data-tag={tag}
              className="overflow-hidden flex-shrink-0"
            >
              <Label
                name={tag}
                styleClass="label-default border-mainGray text-mainGray px-2 py-1 text-9"
              />
            </div>
          ))}
          {visibleTags.length < content.alcoholsTastingTags.length && (
            <div className="flex items-center pt-1.5">
              <Image
                src={'/icon/ellipsis-vertical-mainGray.svg'}
                alt="ellipsis"
                width={9}
                height={2}
              />
            </div>
          )}
        </div>
      </Link>
    </section>
  );
};

export default WhiskeyListItem;

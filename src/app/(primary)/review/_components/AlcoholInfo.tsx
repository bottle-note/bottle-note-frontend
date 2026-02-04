import React from 'react';
import Image from 'next/image';
import { AlcoholInfo as AlcoholType } from '@/types/Alcohol';
import AlcoholImage from '@/components/domain/alcohol/AlcoholImage';
import Label from '@/components/ui/Display/Label';

interface AlcoholInfoProps {
  data?: AlcoholType;
  onSelectAlcohol?: () => void;
}

interface DetailItem {
  title: string;
  content: string;
}

function AlcoholInfo({ data, onSelectAlcohol }: AlcoholInfoProps) {
  const isEmpty = !data;

  // 빈 상태일 때의 기본값
  const korName = data?.korName ?? '위스키를 선택해주세요.';
  const engName = data?.engName ?? 'Search your whisky';
  const korCategory = data?.korCategory ?? '없음';
  const alcoholUrlImg = data?.alcoholUrlImg ?? '';
  const alcoholsTastingTags = data?.alcoholsTastingTags ?? [];

  // 상세 정보 목록 구성
  const alcoholDetails: DetailItem[] = [
    { title: '캐스크', content: data?.cask ?? '-' },
    { title: '증류소', content: data?.engDistillery ?? '-' },
    { title: '국가/지역', content: data?.engRegion ?? '-' },
    { title: '도수', content: data?.abv ? `${data.abv}%` : '-' },
  ];

  return (
    <section className="relative z-10 px-5 pb-[10px]">
      <div className="flex gap-5">
        {/* 이미지 영역 */}
        {isEmpty && onSelectAlcohol ? (
          <button
            type="button"
            onClick={onSelectAlcohol}
            className="w-[99px] h-[171px] bg-white rounded-md flex items-center justify-center shrink-0"
          >
            <Image
              src="/icon/plus-subcoral.svg"
              alt="위스키 선택"
              width={26}
              height={26}
            />
          </button>
        ) : (
          <div className="relative shrink-0">
            <AlcoholImage imageUrl={alcoholUrlImg} />
            {onSelectAlcohol && (
              <button
                type="button"
                onClick={onSelectAlcohol}
                className="absolute bottom-[9px] left-[9px] right-[9px] h-[19px] bg-mainCoral/65 rounded-[3px] flex items-center justify-center"
              >
                <span className="text-white text-[9px] font-normal">
                  위스키 변경
                </span>
              </button>
            )}
          </div>
        )}

        {/* 텍스트 정보 영역 */}
        <article className="w-full text-white space-y-2 overflow-x-hidden">
          <div className="space-y-[8px]">
            {/* 기본 정보: 카테고리, 한글명, 영문명 */}
            <AlcoholBasicInfo
              korCategory={korCategory}
              korName={korName}
              engName={engName}
              isEmpty={isEmpty}
            />

            {/* 상세 정보: 캐스크, 증류소, 국가/지역, 도수 */}
            <AlcoholDetailList details={alcoholDetails} isEmpty={isEmpty} />

            {/* 구분선 */}
            <div
              className={`border-[0.5px] border-white ${isEmpty ? 'opacity-60' : ''}`}
            />
          </div>
        </article>
      </div>

      {/* 테이스팅 태그 */}
      <div className="min-h-[30px]">
        {!isEmpty && <AlcoholTastingTags tags={alcoholsTastingTags} />}
      </div>
    </section>
  );
}

export default AlcoholInfo;

// ============================================
// 서브 컴포넌트: 기본 정보 (카테고리, 이름)
// ============================================

interface AlcoholBasicInfoProps {
  korCategory: string;
  korName: string;
  engName: string;
  isEmpty: boolean;
}

function AlcoholBasicInfo({
  korCategory,
  korName,
  engName,
  isEmpty,
}: AlcoholBasicInfoProps) {
  return (
    <div className="space-y-[6px]">
      <Label
        name={korCategory}
        styleClass={`border-white px-2 py-[0.15rem] rounded-md text-10 ${isEmpty ? 'opacity-60' : ''}`}
      />
      <h1 className="text-16 font-bold whitespace-normal break-words">
        {korName}
      </h1>
      <p
        className={`text-12 whitespace-normal break-words ${isEmpty ? 'opacity-80' : ''}`}
      >
        {isEmpty ? engName : engName?.toUpperCase()}
      </p>
    </div>
  );
}

// ============================================
// 서브 컴포넌트: 상세 정보 목록 (캐스크, 증류소 등)
// ============================================

interface AlcoholDetailListProps {
  details: DetailItem[];
  isEmpty: boolean;
}

function AlcoholDetailList({ details, isEmpty }: AlcoholDetailListProps) {
  return (
    <div>
      {details.map((item: DetailItem) => (
        <div
          key={item.title}
          className={`flex items-start gap-2 text-white ${isEmpty ? 'opacity-60' : ''}`}
        >
          <div className="w-[52px] text-13 font-semibold">{item.title}</div>
          <div className="flex-1 text-12 font-light">{item.content || '-'}</div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// 서브 컴포넌트: 테이스팅 태그
// ============================================

interface AlcoholTastingTagsProps {
  tags: string[];
}

function AlcoholTastingTags({ tags }: AlcoholTastingTagsProps) {
  if (tags.length === 0) return null;

  return (
    <div className="mt-[10px]">
      <div className="flex flex-wrap gap-[6px]">
        {tags.map((tag: string) => (
          <Label
            key={tag}
            name={tag}
            styleClass="border-white px-[10px] py-[5px] rounded-md text-12 text-white"
          />
        ))}
      </div>
    </div>
  );
}

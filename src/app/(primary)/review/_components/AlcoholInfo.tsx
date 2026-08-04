'use client';

import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronDown, X } from 'lucide-react';
import { Drawer } from 'vaul';
import { AlcoholInfo as AlcoholType } from '@/types/Alcohol';
import AlcoholImage from '@/components/domain/alcohol/AlcoholImage';
import Label from '@/components/ui/Display/Label';
import BottomSheet from '@/components/ui/Modal/BottomSheet';

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
            className="flex h-[171px] w-[99px] shrink-0 items-center justify-center rounded-md border border-stroke-neutral-subtle bg-bg-neutral-weak"
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
      <h1 className="text-[18px] font-bold leading-[22px] whitespace-normal break-words">
        {korName}
      </h1>
      <p
        className={`text-13 whitespace-normal break-words ${isEmpty ? 'opacity-80' : ''}`}
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
          <div className="w-[60px] shrink-0 whitespace-nowrap text-14 font-semibold">
            {item.title}
          </div>
          <div className="flex-1 text-13 font-light">{item.content || '-'}</div>
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
  const uniqueTags = useMemo(() => [...new Set(tags)], [tags]);
  const tagListRef = useRef<HTMLUListElement>(null);
  const [visibleTagCount, setVisibleTagCount] = useState(uniqueTags.length);
  const [isTagDrawerOpen, setIsTagDrawerOpen] = useState(false);

  useLayoutEffect(() => {
    const tagList = tagListRef.current;

    if (!tagList) return undefined;

    const measureVisibleTags = () => {
      const tagElements = Array.from(tagList.children) as HTMLElement[];

      if (tagElements.length === 0) {
        setVisibleTagCount(0);
        return;
      }

      const firstLineTop = tagElements[0].offsetTop;
      const firstHiddenIndex = tagElements.findIndex(
        (element) => element.offsetTop > firstLineTop,
      );

      setVisibleTagCount(
        firstHiddenIndex === -1 ? tagElements.length : firstHiddenIndex,
      );
    };

    measureVisibleTags();

    if (typeof ResizeObserver === 'undefined') return undefined;

    const resizeObserver = new ResizeObserver(measureVisibleTags);
    resizeObserver.observe(tagList);

    return () => resizeObserver.disconnect();
  }, [uniqueTags]);

  if (uniqueTags.length === 0) return null;

  const hiddenTagCount = uniqueTags.length - visibleTagCount;

  return (
    <div className="mt-[10px]">
      <ul
        ref={tagListRef}
        className="flex h-7 flex-wrap gap-[6px] overflow-hidden"
      >
        {uniqueTags.map((tag: string, index) => (
          <li
            key={tag}
            aria-hidden={index >= visibleTagCount}
            className="flex h-7 shrink-0 items-center rounded-md border border-white px-[10px] text-12 text-white"
          >
            {tag}
          </li>
        ))}
      </ul>

      {hiddenTagCount > 0 && (
        <div className="mt-1 flex justify-end">
          <button
            type="button"
            aria-expanded={isTagDrawerOpen}
            aria-haspopup="dialog"
            onClick={() => setIsTagDrawerOpen(true)}
            className="flex h-7 items-center gap-1 px-1 text-12 font-medium text-white underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {hiddenTagCount}개 태그 더보기
            <ChevronDown aria-hidden className="h-4 w-4" />
          </button>
        </div>
      )}

      <BottomSheet
        isOpen={isTagDrawerOpen}
        onClose={() => setIsTagDrawerOpen(false)}
        height={40}
      >
        <Drawer.Title className="px-5 pt-4 text-center text-20 font-bold">
          테이스팅 태그 {uniqueTags.length}개
        </Drawer.Title>
        <Drawer.Description className="sr-only">
          이 위스키의 테이스팅 태그 전체 목록입니다.
        </Drawer.Description>
        <button
          type="button"
          aria-label="테이스팅 태그 닫기"
          onClick={() => setIsTagDrawerOpen(false)}
          className="absolute right-4 top-9 flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focus-ring"
        >
          <X aria-hidden className="h-6 w-6" />
        </button>
        <ul className="flex flex-wrap gap-2 overflow-y-auto px-5 pb-safe pt-6">
          {uniqueTags.map((tag) => (
            <li
              key={tag}
              className="flex h-9 items-center rounded-md border border-stroke-neutral-contrast px-3 text-12 text-fg-neutral"
            >
              {tag}
            </li>
          ))}
        </ul>
      </BottomSheet>
    </div>
  );
}

'use client';

import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronDown, Pencil, X } from 'lucide-react';
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
    <section className="relative z-10 px-20 pb-10">
      <div className="flex gap-20">
        {/* 이미지 영역 */}
        {isEmpty && onSelectAlcohol ? (
          <button
            type="button"
            onClick={onSelectAlcohol}
            className="flex h-171 w-99 shrink-0 items-center justify-center rounded-md border border-stroke-neutral-subtle bg-palette-static-white"
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
            <AlcoholImage
              imageUrl={alcoholUrlImg}
              bgColor="bg-palette-static-white"
            />
            {onSelectAlcohol && (
              <button
                type="button"
                onClick={onSelectAlcohol}
                aria-label="위스키 변경"
                className="group absolute inset-0 flex items-end overflow-hidden rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focus-ring"
              >
                <span className="flex h-36 w-full items-center justify-center gap-4 bg-bg-overlay-muted text-palette-static-white backdrop-blur-sm transition-colors group-active:bg-bg-overlay">
                  <Pencil aria-hidden className="h-14 w-14" />
                  <span className="text-11 font-semibold">위스키 변경</span>
                </span>
              </button>
            )}
          </div>
        )}

        {/* 텍스트 정보 영역 */}
        <article className="w-full space-y-8 overflow-x-hidden text-fg-brand-contrast">
          <div className="space-y-8">
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
              className={`border-[0.5px] border-stroke-brand-contrast ${isEmpty ? 'opacity-60' : ''}`}
            />
          </div>
        </article>
      </div>

      {/* 테이스팅 태그 */}
      <div className="min-h-30">
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
    <div className="space-y-6">
      <Label
        name={korCategory}
        styleClass={`border-stroke-brand-contrast px-8 py-[2.4px] rounded-md text-10 ${isEmpty ? 'opacity-60' : ''}`}
      />
      <h1 className="text-18 font-bold whitespace-normal break-words">
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
          className={`flex items-start gap-8 text-fg-brand-contrast ${isEmpty ? 'opacity-60' : ''}`}
        >
          <div className="w-60 shrink-0 whitespace-nowrap text-14 font-semibold">
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
    <div className="mt-10">
      <ul
        ref={tagListRef}
        className="flex h-28 flex-wrap gap-6 overflow-hidden"
      >
        {uniqueTags.map((tag: string, index) => (
          <li
            key={tag}
            aria-hidden={index >= visibleTagCount}
            className="flex h-28 shrink-0 items-center rounded-md border border-stroke-brand-contrast px-10 text-12 text-fg-brand-contrast"
          >
            {tag}
          </li>
        ))}
      </ul>

      {hiddenTagCount > 0 && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            aria-expanded={isTagDrawerOpen}
            aria-haspopup="dialog"
            onClick={() => setIsTagDrawerOpen(true)}
            className="flex h-28 items-center gap-4 px-4 text-12 font-medium text-fg-brand-contrast underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-brand-contrast"
          >
            {hiddenTagCount}개 태그 더보기
            <ChevronDown aria-hidden className="h-16 w-16" />
          </button>
        </div>
      )}

      <BottomSheet
        isOpen={isTagDrawerOpen}
        onClose={() => setIsTagDrawerOpen(false)}
        height={40}
      >
        <Drawer.Title className="px-20 pt-16 text-center text-20 font-bold">
          테이스팅 태그 {uniqueTags.length}개
        </Drawer.Title>
        <Drawer.Description className="sr-only">
          이 위스키의 테이스팅 태그 전체 목록입니다.
        </Drawer.Description>
        <button
          type="button"
          aria-label="테이스팅 태그 닫기"
          onClick={() => setIsTagDrawerOpen(false)}
          className="absolute right-16 top-36 flex h-44 w-44 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focus-ring"
        >
          <X aria-hidden className="h-24 w-24" />
        </button>
        <ul className="flex flex-wrap gap-8 overflow-y-auto px-20 pb-safe pt-24">
          {uniqueTags.map((tag) => (
            <li
              key={tag}
              className="flex h-36 items-center rounded-md border border-stroke-neutral-contrast px-12 text-12 text-fg-neutral"
            >
              {tag}
            </li>
          ))}
        </ul>
      </BottomSheet>
    </div>
  );
}

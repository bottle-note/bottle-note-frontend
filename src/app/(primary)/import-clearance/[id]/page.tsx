'use client';

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { SubHeader } from '@/components/ui/Navigation/SubHeader';
import AlcoholImage from '@/components/domain/alcohol/AlcoholImage';
import Label from '@/components/ui/Display/Label';
import ErrorFallback from '@/components/ui/Display/ErrorFallback';
import PrimaryLinkButton from '@/components/ui/Button/PrimaryLinkButton';
import ListItemSkeleton from '@/components/ui/Loading/Skeletons/ListItemSkeleton';
import { MfdsApi } from '@/api/mfds/mfds.api';
import { parseApiError } from '@/hooks/parseApiError';
import { ROUTES } from '@/constants/routes';
import ImportClearanceCompactItem from '../_components/ImportClearanceCompactItem';
import {
  PROCESSED_DATE_NOTICE,
  declarationName,
  processedDateText,
} from '../_lib/declaration';

const OTHER_DECLARATIONS_LIMIT = 5;

export default function ImportClearanceDetail() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['mfds.alcohol', id],
    queryFn: async () => (await MfdsApi.getAlcohol(id as string)).data,
    enabled: Boolean(id),
    retry: false,
  });

  // 매칭이 확정된 신고만 같은 위스키의 내역으로 묶는다.
  // alcoholNameKo를 함께 넘기면 AND 조건이라 정제 명칭이 다른 행이 빠진다.
  const matchedAlcoholId = data?.alcoholId ?? null;
  const { data: otherDeclarations } = useQuery({
    queryKey: [
      'mfds.alcohols',
      'byAlcohol',
      matchedAlcoholId,
      OTHER_DECLARATIONS_LIMIT + 1,
    ],
    queryFn: async () =>
      (
        await MfdsApi.getAlcohols({
          alcoholId: matchedAlcoholId as number,
          size: OTHER_DECLARATIONS_LIMIT + 1,
        })
      ).data,
    enabled: matchedAlcoholId !== null,
    retry: false,
  });

  const errorInfo = parseApiError(error);

  if (errorInfo) {
    return (
      <>
        <SubHeader>
          <SubHeader.Left onClick={() => router.back()}>
            <Image
              src="/icon/arrow-left-subcoral.svg"
              alt="뒤로가기"
              width={23}
              height={23}
            />
          </SubHeader.Left>
          <SubHeader.Center>수입 정보</SubHeader.Center>
        </SubHeader>
        <ErrorFallback
          message={
            errorInfo.status === 404
              ? '존재하지 않는 수입 정보예요.'
              : '수입 정보를 불러오는데 실패했어요.'
          }
          onBack={() => router.back()}
          onRetry={errorInfo.status !== 404 ? () => refetch() : undefined}
        />
      </>
    );
  }

  if (isLoading || !data) {
    return (
      <>
        <SubHeader>
          <SubHeader.Left onClick={() => router.back()}>
            <Image
              src="/icon/arrow-left-subcoral.svg"
              alt="뒤로가기"
              width={23}
              height={23}
            />
          </SubHeader.Left>
          <SubHeader.Center>수입 정보</SubHeader.Center>
        </SubHeader>
        <div className="px-5">
          {Array.from({ length: 4 }).map((_, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <ListItemSkeleton key={index} />
          ))}
        </div>
      </>
    );
  }

  const { korName, engName } = declarationName(data);
  const importerName = data.importer?.businessName ?? data.importerBaseName;
  const rows = [
    { title: '통관일자', content: processedDateText(data.processedDate) },
    { title: '수입사', content: importerName },
    { title: '제조국', content: data.manufactureCountryNameKo },
    { title: '수출국', content: data.exportCountryNameKo },
    {
      title: '제품 용량',
      content: data.volumeMl ? `${data.volumeMl}ml` : null,
    },
    {
      title: '도수',
      content: data.abvPercent !== null ? `${data.abvPercent}%` : null,
    },
  ].filter((row) => Boolean(row.content));

  const others =
    otherDeclarations
      ?.filter((item) => item.id !== data.id)
      .slice(0, OTHER_DECLARATIONS_LIMIT) ?? [];

  return (
    <div className="pb-navbar">
      <div className="relative">
        <div className="absolute inset-0 bg-bg-brand-primary-solid" />
        <div className="relative z-10">
          <SubHeader bgColor="bg-none">
            <SubHeader.Left onClick={() => router.back()}>
              <Image
                src="/icon/arrow-left-white.svg"
                alt="뒤로가기"
                width={23}
                height={23}
              />
            </SubHeader.Left>
            <SubHeader.Center textColor="text-white">
              수입 정보
            </SubHeader.Center>
          </SubHeader>
          <section className="flex space-x-[22px] px-5 pb-6 pt-[6px]">
            <AlcoholImage
              imageUrl=""
              outerWidthClass="w-[73px]"
              outerHeightClass="h-[120px]"
              innerWidthClass="w-[53px]"
              innerHeightClass="h-[104px]"
            />
            <article className="w-2/3 space-y-2 overflow-x-hidden pb-[9.15px] pt-[5px] text-white">
              {data.alcoholCategoryKo && (
                <Label
                  name={data.alcoholCategoryKo}
                  styleClass="border-white px-2 py-[0.15rem] rounded-md text-10"
                />
              )}
              <h1 className="whitespace-normal break-words text-15 font-semibold">
                {korName}
              </h1>
              {engName && (
                <p className="whitespace-normal break-words text-12 font-normal">
                  {engName.toUpperCase()}
                </p>
              )}
            </article>
          </section>
        </div>
      </div>

      <section className="mx-5 space-y-2 border-b border-stroke-neutral-subtle py-5 text-13.5">
        {rows.map((row) => (
          <div key={row.title} className="flex items-start gap-2">
            <p className="min-w-16 font-bold text-fg-neutral">{row.title}</p>
            <p className="flex-1 break-words font-normal text-fg-neutral">
              {row.content}
            </p>
          </div>
        ))}
        <p className="pt-1 text-11 text-fg-neutral-muted">
          {PROCESSED_DATE_NOTICE}
        </p>
      </section>

      {others.length > 0 && (
        <section className="mx-5 py-5">
          <h2 className="pb-1 text-13 font-bold text-fg-neutral">
            같은 위스키의 다른 수입 내역
          </h2>
          {others.map((item) => (
            <ImportClearanceCompactItem key={item.id} item={item} />
          ))}
        </section>
      )}

      {data.alcoholId !== null && (
        <section className="mx-5 mb-6 mt-2">
          <PrimaryLinkButton
            data={{
              engName: 'VIEW WHISKY',
              korName: '보틀노트에서 위스키 보기',
              icon: true,
              linkSrc: ROUTES.SEARCH.ALL(data.alcoholId),
            }}
          />
        </section>
      )}
    </div>
  );
}

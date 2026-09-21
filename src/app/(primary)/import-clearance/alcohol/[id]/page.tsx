'use client';

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Building2,
  Calendar,
  CalendarCheck,
  CalendarRange,
  Factory,
  Hash,
  MapPin,
  Package,
  Phone,
  Ship,
  Sparkles,
  User,
  type LucideIcon,
} from 'lucide-react';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import { useLoginBridge } from '@/hooks/useLoginBridge';
import { SubHeader } from '@/components/ui/Navigation/SubHeader';
import Label from '@/components/ui/Display/Label';
import ErrorFallback from '@/components/ui/Display/ErrorFallback';
import {
  STICKY_BOTTOM_CTA_PADDING_CLASS,
  StickyBottomCta,
} from '@/components/ui/Layout/StickyBottomCta';
import SkeletonBase from '@/components/ui/Loading/Skeletons/SkeletonBase';
import { LoginGate } from '@/components/feature/auth/LoginGate';
import { MfdsApi } from '@/api/mfds/mfds.api';
import { parseApiError } from '@/hooks/parseApiError';
import { formatDate } from '@/utils/formatDate';
import { ROUTES } from '@/constants/routes';
import InfoRow from './_components/InfoRow';
import ImportClearanceCompactItem from '../../_components/ImportClearanceCompactItem';
import { declarationName } from '../../_lib/declaration';

const OTHER_DECLARATIONS_LIMIT = 5;

interface Row {
  icon: LucideIcon;
  label: string;
  value: string | null;
}

const withValue = (rows: Row[]) =>
  rows.filter(
    (row): row is Row & { value: string } =>
      row.value !== null && row.value !== '',
  );

export default function ImportClearanceDetail() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { isLoggedIn, isLoading: isAuthLoading } = useAuthSession();
  const { bridgeToLogin } = useLoginBridge();

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['mfds.alcohol', id],
    queryFn: async () => (await MfdsApi.getAlcohol(id as string)).data,
    enabled: Boolean(id),
    retry: false,
  });

  // 정제명(alcoholNameKo) 기반으로 같은 위스키의 수입 내역을 조회한다.
  // 수입사·용량이 달라도 동일 명칭 계열이 함께 노출된다.
  const alcoholNameForMatching = data?.alcoholNameKo || undefined;
  const { data: otherDeclarations } = useQuery({
    queryKey: [
      'mfds.alcohols',
      'byAlcoholName',
      alcoholNameForMatching,
      OTHER_DECLARATIONS_LIMIT + 1,
    ],
    queryFn: async () =>
      (
        await MfdsApi.getAlcohols({
          alcoholNameKo: alcoholNameForMatching,
          size: OTHER_DECLARATIONS_LIMIT + 1,
        })
      ).data,
    enabled: alcoholNameForMatching !== undefined,
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
        <div className="relative">
          <div className="absolute inset-0 bg-bg-brand-primary-solid dark:bg-palette-oak-950" />
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
              <SubHeader.Center textColor="text-white dark:text-palette-oak-50">
                수입 정보
              </SubHeader.Center>
            </SubHeader>
            <section className="space-y-2.5 px-5 pb-6 pt-1">
              <SkeletonBase width={60} height={14} />
              <SkeletonBase width="70%" height={20} />
              <SkeletonBase width="100%" height={12} />
            </section>
          </div>
        </div>

        <div className="mx-5 space-y-4 py-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <section
              key={index}
              className="space-y-3 border-b border-stroke-neutral-subtle py-4"
            >
              <SkeletonBase width={80} height={14} />
              <SkeletonBase width="100%" height={12} />
              <SkeletonBase width="80%" height={12} />
            </section>
          ))}
        </div>
      </>
    );
  }

  const { korName, engName } = declarationName(data);

  const specText = [
    data.abvPercent !== null ? `도수 ${data.abvPercent}%` : null,
    data.volumeMl !== null ? `용량 ${data.volumeMl}ml` : null,
  ]
    .filter((part): part is string => part !== null)
    .join(' · ');

  const productionRows = withValue([
    { icon: Factory, label: '제조사', value: data.manufacturerName },
    { icon: MapPin, label: '제조국', value: data.manufactureCountryNameKo },
    {
      icon: Calendar,
      label: '빈티지',
      value: data.vintageYear !== null ? `${data.vintageYear}년` : null,
    },
    { icon: Sparkles, label: '에디션', value: data.editionName },
    { icon: Hash, label: '캐스크 번호', value: data.caskNumber },
    { icon: Hash, label: '배치 번호', value: data.batchNumber },
    {
      icon: Package,
      label: '포장 수량',
      value: data.packageCount !== null ? `${data.packageCount}개입` : null,
    },
  ]);

  const customsRows = withValue([
    {
      icon: CalendarCheck,
      label: '통관일자',
      value: data.processedDate
        ? (formatDate(data.processedDate, 'FULL_DATE') as string)
        : null,
    },
    { icon: Ship, label: '수출국', value: data.exportCountryNameKo },
    {
      icon: CalendarRange,
      label: '유효기간',
      value:
        data.expiryStart && data.expiryEnd
          ? `${formatDate(data.expiryStart, 'FULL_DATE') as string} ~ ${
              formatDate(data.expiryEnd, 'FULL_DATE') as string
            }`
          : null,
    },
  ]);

  const others =
    otherDeclarations
      ?.filter((item) => item.id !== data.id)
      .slice(0, OTHER_DECLARATIONS_LIMIT) ?? [];

  const heroSection = (
    <div className="relative">
      <div className="absolute inset-0 bg-bg-brand-primary-solid dark:bg-palette-oak-950" />
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
          <SubHeader.Center textColor="text-white dark:text-palette-oak-50">
            수입 정보
          </SubHeader.Center>
        </SubHeader>
        <section className="space-y-2.5 px-5 pb-6 pt-1 text-white dark:text-palette-oak-50">
          <div className="space-y-1.5">
            {data.alcoholCategoryKo && (
              <Label
                name={data.alcoholCategoryKo}
                styleClass="border-white dark:border-palette-oak-50 px-2 py-[0.15rem] rounded-md text-10 dark:text-palette-oak-50"
              />
            )}
            <h1 className="whitespace-normal break-words text-20 font-bold">
              {korName}
            </h1>
            {engName && (
              <p className="whitespace-normal break-words text-12 font-normal">
                {engName.toUpperCase()}
              </p>
            )}
          </div>
          {specText && (
            <>
              <div className="border-[0.5px] border-white dark:border-palette-oak-50" />
              <p className="text-11 text-white/85">{specText}</p>
            </>
          )}
        </section>
      </div>
    </div>
  );

  const renderPageContent = () => (
    <>
      {productionRows.length > 0 && (
        <section className="mx-5 space-y-3 border-b border-stroke-neutral-subtle py-4">
          <p className="text-12 font-bold tracking-wide text-fg-neutral-subtle">
            제품 정보
          </p>
          {productionRows.map((row) => (
            <InfoRow key={row.label} {...row} />
          ))}
        </section>
      )}

      {data.importer ? (
        <section className="mx-5 py-4">
          <p className="mb-2 text-12 font-bold tracking-wide text-fg-neutral-subtle">
            수입사 정보
          </p>
          <div className="space-y-3 rounded-xl bg-bg-neutral-weak p-4">
            <div className="flex items-center gap-2">
              <Building2
                size={16}
                className="shrink-0 text-fg-neutral-subtle"
                aria-hidden
              />
              <p className="flex-1 break-words text-13.5 font-bold text-fg-neutral">
                {data.importer.businessName}
              </p>
            </div>
            {(data.importer.representativeName ||
              data.importer.industryName) && (
              <div className="flex items-start gap-2">
                <User
                  size={14}
                  className="mt-0.5 shrink-0 text-fg-neutral-subtle"
                  aria-hidden
                />
                <p className="text-12 text-fg-neutral-muted">
                  {[
                    data.importer.representativeName &&
                      `대표 ${data.importer.representativeName}`,
                    data.importer.industryName,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>
            )}
            {data.importer.primaryAddress && (
              <div className="flex items-start gap-2">
                <MapPin
                  size={14}
                  className="mt-0.5 shrink-0 text-fg-neutral-subtle"
                  aria-hidden
                />
                <p className="break-words text-12 text-fg-neutral-muted">
                  {data.importer.primaryAddress}
                </p>
              </div>
            )}
            {data.importer.telephoneNo && (
              <div className="flex items-start gap-2">
                <Phone
                  size={14}
                  className="mt-0.5 shrink-0 text-fg-neutral-subtle"
                  aria-hidden
                />
                <p className="text-12 text-fg-neutral-muted">
                  {data.importer.telephoneNo}
                </p>
              </div>
            )}
          </div>
        </section>
      ) : (
        data.importerBaseName && (
          <section className="mx-5 border-b border-stroke-neutral-subtle py-4">
            <InfoRow
              icon={Building2}
              label="수입사"
              value={data.importerBaseName}
            />
          </section>
        )
      )}

      {customsRows.length > 0 && (
        <section className="mx-5 space-y-3 border-b border-stroke-neutral-subtle py-4">
          <p className="text-12 font-bold tracking-wide text-fg-neutral-subtle">
            통관 내역
          </p>
          {customsRows.map((row) => (
            <InfoRow key={row.label} {...row} />
          ))}
        </section>
      )}

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
        <StickyBottomCta
          label="보틀노트에서 위스키 보기"
          onClick={() => router.push(ROUTES.SEARCH.ALL(data.alcoholId!))}
        />
      )}
    </>
  );

  const contentSkeleton = (
    <div className="mx-5 space-y-4 py-4">
      {Array.from({ length: 2 }).map((_, index) => (
        <section
          key={index}
          className="space-y-3 border-b border-stroke-neutral-subtle py-4"
        >
          <SkeletonBase width={80} height={14} />
          <SkeletonBase width="100%" height={12} />
          <SkeletonBase width="80%" height={12} />
        </section>
      ))}
    </div>
  );

  if (!isLoggedIn && !isAuthLoading) {
    return (
      <div
        className={
          data?.alcoholId !== null
            ? STICKY_BOTTOM_CTA_PADDING_CLASS
            : 'pb-navbar'
        }
      >
        {heroSection}
        {isLoading || !data ? (
          contentSkeleton
        ) : (
          <LoginGate
            variant="blur"
            title="더 알고 싶으신가요?"
            description="로그인하고 이 수입 정보를 무료로 확인하세요"
            buttonLabel="로그인하고 보기"
            onLogin={() => bridgeToLogin()}
            visibleHeight="min-h-[70vh]"
            gradientStartPercent={80}
          >
            {renderPageContent()}
          </LoginGate>
        )}
      </div>
    );
  }

  return (
    <div
      className={
        data.alcoholId !== null ? STICKY_BOTTOM_CTA_PADDING_CLASS : 'pb-navbar'
      }
    >
      {heroSection}
      {isLoading || !data ? contentSkeleton : renderPageContent()}
    </div>
  );
}

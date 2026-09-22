'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Building2,
  ChevronRight,
  User,
  MapPin,
  Phone,
  Calendar,
  Hash,
  type LucideIcon,
} from 'lucide-react';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import { useLoginBridge } from '@/hooks/useLoginBridge';
import { SubHeader } from '@/components/ui/Navigation/SubHeader';
import SkeletonBase from '@/components/ui/Loading/Skeletons/SkeletonBase';
import { LoginGate } from '@/components/feature/auth/LoginGate';
import { MfdsApi } from '@/api/mfds/mfds.api';
import { formatDate } from '@/utils/formatDate';
import ErrorFallback from '@/components/ui/Display/ErrorFallback';
import { parseApiError } from '@/hooks/parseApiError';
import { ROUTES } from '@/constants/routes';
import ImportClearanceCompactItem from '../../_components/ImportClearanceCompactItem';
import InfoRow from '../../alcohol/[id]/_components/InfoRow';

interface Row {
  icon: LucideIcon;
  label: string;
  value: string | null;
}

const RECENT_DECLARATIONS_LIMIT = 5;

const withValue = (rows: Row[]) =>
  rows.filter(
    (row): row is Row & { value: string } =>
      row.value !== null && row.value !== '',
  );

export default function ImporterDetail() {
  const router = useRouter();
  const params = useParams();
  const importerId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { isLoggedIn, isLoading: isAuthLoading } = useAuthSession();
  const { bridgeToLogin } = useLoginBridge();

  const {
    data: importer,
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['mfds.importer', importerId],
    queryFn: async () => (await MfdsApi.getImporter(importerId as string)).data,
    enabled: Boolean(importerId),
    retry: false,
  });

  const {
    data: alcoholsByImporter,
    isLoading: isAlcoholsLoading,
    isError: isAlcoholsError,
    refetch: refetchAlcohols,
  } = useQuery({
    queryKey: [
      'mfds.alcohols',
      'byImporterId',
      importer?.id,
      RECENT_DECLARATIONS_LIMIT + 1,
    ],
    queryFn: async () =>
      (
        await MfdsApi.getAlcohols({
          importerId: importer!.id,
          size: RECENT_DECLARATIONS_LIMIT + 1,
        })
      ).data,
    enabled: Boolean(importer),
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
          <SubHeader.Center>수입사</SubHeader.Center>
        </SubHeader>
        <ErrorFallback
          message={
            errorInfo.status === 404
              ? '존재하지 않는 수입사예요.'
              : '수입사 정보를 불러오는데 실패했어요.'
          }
          onBack={() => router.back()}
          onRetry={errorInfo.status !== 404 ? () => refetch() : undefined}
        />
      </>
    );
  }

  if (isLoading || !importer) {
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
                수입사
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

  const importerName = importer.businessName || '수입사명 미상';
  const recentDeclarations =
    alcoholsByImporter?.slice(0, RECENT_DECLARATIONS_LIMIT) ?? [];
  const hasMoreRecentDeclarations =
    (alcoholsByImporter?.length ?? 0) > RECENT_DECLARATIONS_LIMIT;
  const sections = [
    {
      title: '기본 정보',
      rows: withValue([
        { icon: Building2, label: '업종', value: importer.industryName },
        { icon: User, label: '대표자', value: importer.representativeName },
        { icon: Building2, label: '영업상태', value: importer.operatingStatus },
      ]),
    },
    {
      title: '연락처',
      rows: withValue([
        { icon: MapPin, label: '주소', value: importer.primaryAddress },
        { icon: Phone, label: '전화번호', value: importer.telephoneNo },
      ]),
    },
    {
      title: '인허가 정보',
      rows: withValue([
        {
          icon: Calendar,
          label: '인허가일',
          value: importer.permitDate
            ? (formatDate(importer.permitDate, 'FULL_DATE') as string)
            : null,
        },
        {
          icon: Building2,
          label: '인허가기관',
          value: importer.institutionName,
        },
        { icon: Hash, label: '인허가번호', value: importer.licenseNo },
        { icon: Hash, label: '업소코드', value: importer.officialBusinessCode },
      ]),
    },
  ];

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
            수입사
          </SubHeader.Center>
        </SubHeader>
        <section className="space-y-2.5 px-5 pb-6 pt-1 text-white dark:text-palette-oak-50">
          <h1 className="whitespace-normal break-words text-20 font-bold">
            {importerName}
          </h1>
        </section>
      </div>
    </div>
  );

  const renderPageContent = () => (
    <>
      {sections
        .filter((section) => section.rows.length > 0)
        .map((section) => (
          <section
            key={section.title}
            className="mx-5 space-y-3 border-b border-stroke-neutral-subtle py-4"
          >
            <h2 className="text-12 font-bold tracking-wide text-fg-neutral-subtle">
              {section.title}
            </h2>
            {section.rows.map((row) => (
              <InfoRow key={row.label} {...row} />
            ))}
          </section>
        ))}
      {importer.description && (
        <section className="mx-5 space-y-3 border-b border-stroke-neutral-subtle py-4">
          <h2 className="text-12 font-bold tracking-wide text-fg-neutral-subtle">
            수입사 소개
          </h2>
          <p className="whitespace-pre-wrap break-words text-13 leading-relaxed text-fg-neutral">
            {importer.description}
          </p>
        </section>
      )}
      <section className="mx-5 py-5">
        <h2 className="pb-1 text-13 font-bold text-fg-neutral">
          최근 수입 내역
        </h2>
        {isAlcoholsLoading ? (
          <div className="space-y-3 py-3">
            <SkeletonBase width="100%" height={12} />
            <SkeletonBase width="80%" height={12} />
          </div>
        ) : isAlcoholsError ? (
          <div className="space-y-2 py-3 text-12 text-fg-neutral-muted">
            <p>수입 내역을 불러오지 못했어요.</p>
            <button
              type="button"
              className="text-fg-brand"
              onClick={() => refetchAlcohols()}
            >
              다시 시도
            </button>
          </div>
        ) : recentDeclarations.length ? (
          recentDeclarations.map((item) => (
            <ImportClearanceCompactItem key={item.id} item={item} />
          ))
        ) : (
          <p className="py-3 text-12 text-fg-neutral-muted">
            등록된 수입 내역이 없어요.
          </p>
        )}
        {hasMoreRecentDeclarations && (
          <Link
            href={`${ROUTES.IMPORT_CLEARANCE.BASE}?keyword=${encodeURIComponent(importerName)}`}
            className="mt-2 flex items-center justify-center gap-1 py-2 text-12 font-semibold text-fg-brand"
          >
            전체 수입 내역 보기
            <ChevronRight size={14} aria-hidden />
          </Link>
        )}
      </section>
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
      <div className="pb-navbar">
        {heroSection}
        <LoginGate
          variant="blur"
          title="더 알고 싶으신가요?"
          description="로그인하고 이 수입사 정보를 무료로 확인하세요"
          buttonLabel="로그인하고 보기"
          onLogin={() => bridgeToLogin()}
          visibleHeight="min-h-[70vh]"
          gradientStartPercent={80}
        >
          {renderPageContent()}
        </LoginGate>
      </div>
    );
  }

  return (
    <div className="pb-navbar">
      {heroSection}
      {isAuthLoading ? contentSkeleton : renderPageContent()}
    </div>
  );
}

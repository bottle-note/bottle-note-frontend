'use client';

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Building2,
  User,
  MapPin,
  Phone,
  Calendar,
  type LucideIcon,
} from 'lucide-react';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import { useLoginBridge } from '@/hooks/useLoginBridge';
import { SubHeader } from '@/components/ui/Navigation/SubHeader';
import SkeletonBase from '@/components/ui/Loading/Skeletons/SkeletonBase';
import { LoginGate } from '@/components/feature/auth/LoginGate';
import { MfdsApi } from '@/api/mfds/mfds.api';
import { formatDate } from '@/utils/formatDate';
import InfoRow from '../../alcohol/[id]/_components/InfoRow';

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

export default function ImporterDetail() {
  const router = useRouter();
  const params = useParams();
  const importerId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { isLoggedIn, isLoading: isAuthLoading } = useAuthSession();
  const { bridgeToLogin } = useLoginBridge();

  // TODO: API 엔드포인트 확인 필요
  // MfdsApi.getImporter(importerId)
  // 현재는 getAlcohols로 필터링하여 importerId 정보 추론
  const { data: alcoholsByImporter, isLoading } = useQuery({
    queryKey: ['mfds.alcohols', 'byImporterId', importerId],
    queryFn: async () =>
      (
        await MfdsApi.getAlcohols({
          importerId: Number(importerId),
          size: 100,
        })
      ).data,
    enabled: Boolean(importerId),
    retry: false,
  });

  if (isLoading && !alcoholsByImporter) {
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

  // 첫 번째 데이터에서 수입사 정보 추론
  const firstItem = alcoholsByImporter?.[0];
  const importerName = firstItem?.importerBaseName ?? '수입사명 미상';

  const basicRows = withValue([
    {
      icon: Building2,
      label: '상호명',
      value: importerName,
    },
  ]);

  const contactRows = withValue([]);

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
      {basicRows.length > 0 && (
        <section className="mx-5 space-y-3 border-b border-stroke-neutral-subtle py-4">
          <p className="text-12 font-bold tracking-wide text-fg-neutral-subtle">
            기본 정보
          </p>
          {basicRows.map((row) => (
            <InfoRow key={row.label} {...row} />
          ))}
        </section>
      )}

      {contactRows.length > 0 && (
        <section className="mx-5 space-y-3 border-b border-stroke-neutral-subtle py-4">
          <p className="text-12 font-bold tracking-wide text-fg-neutral-subtle">
            연락처
          </p>
          {contactRows.map((row) => (
            <InfoRow key={row.label} {...row} />
          ))}
        </section>
      )}

      {alcoholsByImporter && alcoholsByImporter.length > 0 && (
        <>
          <section className="mx-5 py-5">
            <h2 className="pb-1 text-13 font-bold text-fg-neutral">
              수입 현황
            </h2>
            <div className="space-y-2 rounded-xl bg-bg-neutral-weak p-4">
              <div className="flex items-center justify-between">
                <span className="text-12 text-fg-neutral-muted">
                  총 수입 건수
                </span>
                <span className="text-13 font-bold text-fg-neutral">
                  {alcoholsByImporter.length}건
                </span>
              </div>
            </div>
          </section>

          <section className="mx-5 py-5">
            <h2 className="pb-1 text-13 font-bold text-fg-neutral">
              최근 수입 내역
            </h2>
            <div className="space-y-2">
              {alcoholsByImporter.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg bg-bg-neutral-weak p-3"
                >
                  <p className="text-13 font-bold text-fg-neutral">
                    {item.baseProductNameKo ??
                      item.skuDisplayNameKo ??
                      '상품명 미상'}
                  </p>
                  {item.processedDate && (
                    <p className="mt-1 text-11 text-fg-neutral-muted">
                      {formatDate(item.processedDate, 'FULL_DATE') as string}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        </>
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
      <div className="pb-navbar">
        {heroSection}
        {isLoading || !alcoholsByImporter ? (
          contentSkeleton
        ) : (
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
        )}
      </div>
    );
  }

  return (
    <div className="pb-navbar">
      {heroSection}
      {isLoading || !alcoholsByImporter ? contentSkeleton : renderPageContent()}
    </div>
  );
}

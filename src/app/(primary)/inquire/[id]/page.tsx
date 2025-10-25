'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { SubHeader } from '@/components/ui/Navigation/SubHeader';
import BaseImage from '@/components/ui/Display/BaseImage';
import { InquireApi } from '@/app/api/InquireApi';
import { formatDate } from '@/utils/formatDate';
import {
  ServiceInquireDetailsApi,
  BusinessInquireDetailsApi,
  UnifiedInquireDetails,
  Status,
} from '@/types/Inquire';
import {
  INQUIRE_TYPE,
  SERVICE_TYPE_LIST,
  BUSINESS_TYPE_LIST,
  getStatusText,
} from '@/constants/Inquire';

const createServiceAdapter = (
  data: ServiceInquireDetailsApi,
  typeList: any[],
): UnifiedInquireDetails => ({
  ...data,
  id: data.helpId,
  status: data.statusType,
  type: data.helpType,
  typeName: typeList.find((item) => item.type === data.helpType)?.name || '',
});

const createBusinessAdapter = (
  data: BusinessInquireDetailsApi,
  typeList: any[],
): UnifiedInquireDetails => ({
  ...data,
  type: data.businessSupportType,
  typeName:
    typeList.find((item) => item.type === data.businessSupportType)?.name || '',
});

export default function Inquire() {
  const router = useRouter();
  const { id: helpId } = useParams();
  const searchParams = useSearchParams();
  const paramsType =
    (searchParams.get('type') as keyof typeof INQUIRE_TYPE) || 'service';
  const serviceType = INQUIRE_TYPE[paramsType] || paramsType;
  const typeList =
    paramsType === 'business'
      ? [...BUSINESS_TYPE_LIST]
      : [...SERVICE_TYPE_LIST];
  const [inquireDetails, setInquireDetails] =
    useState<UnifiedInquireDetails | null>(null);

  useEffect(() => {
    async function fetchInquireDetails() {
      if (!helpId) return;
      try {
        const result =
          paramsType === 'business'
            ? await InquireApi.getBusinessInquireDetails(helpId)
            : await InquireApi.getInquireDetails(helpId);

        const adaptedResult =
          paramsType === 'business'
            ? createBusinessAdapter(
                result as BusinessInquireDetailsApi,
                typeList,
              )
            : createServiceAdapter(
                result as ServiceInquireDetailsApi,
                typeList,
              );

        setInquireDetails(adaptedResult);
      } catch (error) {
        console.error('Failed to fetch review details:', error);
      }
    }

    fetchInquireDetails();
  }, [helpId, paramsType]);

  return (
    <>
      <section className="pb-8 relative">
        <SubHeader>
          <SubHeader.Left
            onClick={() => {
              router.back();
            }}
          >
            <Image
              src="/icon/arrow-left-subcoral.svg"
              alt="arrowIcon"
              width={23}
              height={23}
            />
          </SubHeader.Left>
          <SubHeader.Center>{serviceType} 문의 내역</SubHeader.Center>
        </SubHeader>
        {inquireDetails !== null && (
          <>
            <article className="mt-4 mx-5 flex justify-between items-center">
              <p className="text-13 font-bold text-subCoral">
                {inquireDetails.typeName} 문의
              </p>
              <p className="text-12 text-mainGray">
                {formatDate(inquireDetails.createAt) as string}
              </p>
            </article>

            <article className="mx-5 mt-2 space-y-[18px]">
              <h3 className="text-16 font-bold text-black">
                {inquireDetails.title}
              </h3>
              <div>
                <p
                  className="text-12 text-black whitespace-pre-line"
                  dangerouslySetInnerHTML={{
                    __html: inquireDetails.content?.replace(/\n/g, '<br />'),
                  }}
                />
              </div>
              {inquireDetails.imageUrlList.length > 0 && (
                <div className="flex overflow-x-auto gap-[6px] pb-2">
                  {inquireDetails.imageUrlList.map((imgData) => (
                    <div
                      className="relative flex-shrink-0 cursor-pointer"
                      key={imgData.viewUrl}
                      role="button"
                      tabIndex={0}
                      onClick={() =>
                        router.push(
                          `/image-viewer?src=${encodeURIComponent(imgData.viewUrl)}&title=${encodeURIComponent('첨부이미지')}`,
                        )
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          router.push(
                            `/image-viewer?src=${encodeURIComponent(imgData.viewUrl)}&title=${encodeURIComponent('첨부이미지')}`,
                          );
                        }
                      }}
                    >
                      <BaseImage
                        src={imgData.viewUrl}
                        alt="Inquire image"
                        priority
                        className="cover"
                        width={104}
                        height={104}
                      />
                    </div>
                  ))}
                </div>
              )}
            </article>

            <article className="border-t border-b border-bgGray mx-5 my-[26px] py-[26px]">
              <div className="flex items-center justify-between">
                <p className="text-13 text-subCoral font-bold">
                  {getStatusText(inquireDetails.status as Status)}
                </p>
                {inquireDetails.adminId && inquireDetails.lastModifyAt && (
                  <p className="text-mainGray text-12">
                    {formatDate(inquireDetails.lastModifyAt) as string}
                  </p>
                )}
              </div>
              {inquireDetails.adminId && (
                <div className="pt-5 text-10 break-words leading-none text-mainDarkGray">
                  {inquireDetails.responseContent}
                </div>
              )}
            </article>
          </>
        )}
      </section>
    </>
  );
}

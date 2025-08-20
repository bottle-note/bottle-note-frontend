'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { SubHeader } from '@/app/(primary)/_components/SubHeader';
import BaseImage from '@/components/BaseImage';
import { InquireApi } from '@/app/api/InquireApi';
import { formatDate } from '@/utils/formatDate';
import { InquireDetailsApi } from '@/types/Inquire';
import {
  INQUIRE_TYPE,
  SERVICE_TYPE_LIST,
  BUSINESS_TYPE_LIST,
} from '@/constants/Inquire';

export default function Inquire() {
  const router = useRouter();
  const { id: helpId } = useParams();
  const searchParams = useSearchParams();
  const paramsType =
    (searchParams.get('type') as keyof typeof INQUIRE_TYPE) || 'service';
  const serviceType = INQUIRE_TYPE[paramsType] || paramsType;
  const typeList =
    paramsType === 'business' ? BUSINESS_TYPE_LIST : SERVICE_TYPE_LIST;
  const [inquireDetails, setInquireDetails] =
    useState<InquireDetailsApi | null>(null);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'WAITING':
        return '답변대기중';
      case 'SUCCESS':
        return '답변완료';
      case 'REJECT':
        return '반려';
      case 'DELETED':
        return '삭제';
      default:
        return '답변대기중';
    }
  };

  useEffect(() => {
    async function fetchInquireDetails() {
      if (!helpId) return;
      try {
        const result = await InquireApi.getInquireDetails(helpId);
        setInquireDetails(result);
      } catch (error) {
        console.error('Failed to fetch review details:', error);
      }
    }

    fetchInquireDetails();
  }, [helpId]);

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
                {
                  typeList.find((item) => item.type === inquireDetails.helpType)
                    ?.name
                }{' '}
                문의
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
            </article>

            <article className="border-t border-b border-bgGray mx-5 my-[26px] py-[26px]">
              <div className="flex items-center justify-between">
                <p className="text-13 text-subCoral font-bold">
                  {getStatusText(inquireDetails.statusType)}
                </p>
                {inquireDetails.lastModifyAt && (
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

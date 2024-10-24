'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { SubHeader } from '@/app/(primary)/_components/SubHeader';
import { InquireApi } from '@/app/api/InquireApi';
import { formatDate } from '@/utils/formatDate';
import { InquireDetailsApi } from '@/types/Inquire';
import Badge from '@/components/Badge';
import adminDefaultImg from 'public/bottle_note_profile.svg';

const TYPE_OPTIONS: { [key: string]: string } = {
  WHISKEY: '위스키',
  REVIEW: '리뷰',
  USER: '사용자',
  ETC: '기타',
};

export default function Inquire() {
  const router = useRouter();
  const { id: helpId } = useParams();
  const [inquireDetails, setInquireDetails] =
    useState<InquireDetailsApi | null>(null);

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
        <SubHeader bgColor="bg-bgGray">
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
          <SubHeader.Center textColor="text-subCoral">
            나의 문의 상세
          </SubHeader.Center>
        </SubHeader>
        {inquireDetails !== null && (
          <>
            <article className="mt-5 mx-5 text-13 text-mainGray">
              {formatDate(inquireDetails.createAt)}
            </article>
            <article className="mx-5 mt-2 py-3 border-t-[0.01rem] border-b-[0.01rem] border-mainGray/30">
              <div className="flex pb-3 items-center space-x-2">
                <h3 className="text-lg font-semibold">
                  [{TYPE_OPTIONS[inquireDetails.helpType]} 문의]
                </h3>
                <Badge type={inquireDetails.statusType} />
              </div>
              <div className="space-y-2">
                {inquireDetails.imageUrlList.map((imgData) => (
                  <div className="relative w-full h-52" key={imgData.viewUrl}>
                    <Image
                      src={imgData.viewUrl}
                      alt="review_img"
                      fill
                      className="cover"
                    />
                  </div>
                ))}
              </div>
              <p className="pt-3 text-13 break-words leading-none text-mainDarkGray ">
                {inquireDetails.content}
              </p>
            </article>
            {inquireDetails.adminId && (
              <article className="mx-5 py-3 space-y-4 border-b-[0.01rem] border-mainGray/30">
                <div className="flex justify-between items-center space-x-1 ">
                  <div className="flex justify-start items-center space-x-2">
                    <div className="w-[1.9rem] h-[1.9rem] rounded-full overflow-hidden">
                      <Image
                        className="object-cover"
                        src={adminDefaultImg}
                        alt="bottle_note_img"
                        width={30}
                        height={30}
                      />
                    </div>
                    <p className="text-mainGray text-10">보틀노트</p>
                  </div>
                  <p className="text-mainGray text-10">
                    {formatDate(inquireDetails.lastModifyAt)}
                  </p>
                </div>
                <div className="text-10 break-words leading-none text-mainDarkGray">
                  {inquireDetails.responseContent}
                </div>
              </article>
            )}
          </>
        )}
      </section>
    </>
  );
}

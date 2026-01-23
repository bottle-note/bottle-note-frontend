'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

import { SubHeader } from '@/components/ui/Navigation/SubHeader';
import NavLayout from '@/components/ui/Layout/NavLayout';
import { AlcoholsApi } from '@/api/alcohol/alcohol.api';
import { AlcoholInfo } from '@/api/alcohol/types';

import TastingNoteForm from './_components/TastingNoteForm';

export default function TastingNotePage() {
  const router = useRouter();
  const params = useParams();
  const alcoholId = params.alcoholId as string;

  const [alcohol, setAlcohol] = useState<AlcoholInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAlcohol = async () => {
      try {
        const response = await AlcoholsApi.getAlcoholDetails(alcoholId);
        if (response?.data?.alcohols) {
          setAlcohol(response.data.alcohols);
        }
      } catch (error) {
        console.error('Failed to fetch alcohol:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (alcoholId) {
      fetchAlcohol();
    }
  }, [alcoholId]);

  if (isLoading) {
    return (
      <NavLayout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-mainGray">로딩 중...</p>
        </div>
      </NavLayout>
    );
  }

  if (!alcohol) {
    return (
      <NavLayout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-mainGray">위스키 정보를 찾을 수 없습니다.</p>
        </div>
      </NavLayout>
    );
  }

  return (
    <NavLayout>
      <SubHeader bgColor="bg-white">
        <SubHeader.Left onClick={() => router.back()}>
          <Image
            src="/icon/arrow-left-subcoral.svg"
            alt="back"
            width={23}
            height={23}
          />
        </SubHeader.Left>
        <SubHeader.Center>테이스팅 노트</SubHeader.Center>
      </SubHeader>

      {/* 위스키 정보 헤더 */}
      <div className="px-5 py-4 border-b border-mainGray/30">
        <div className="flex items-center gap-3">
          <div className="relative w-14 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
            {alcohol.alcoholUrlImg && (
              <Image
                src={alcohol.alcoholUrlImg}
                alt={alcohol.korName}
                fill
                className="object-contain"
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-16 font-bold text-mainDarkGray truncate">
              {alcohol.korName}
            </p>
            <p className="text-12 text-mainGray truncate">{alcohol.engName}</p>
          </div>
        </div>
      </div>

      <TastingNoteForm
        alcoholId={alcoholId}
        alcoholName={alcohol.korName}
        alcoholImage={alcohol.alcoholUrlImg}
      />
    </NavLayout>
  );
}

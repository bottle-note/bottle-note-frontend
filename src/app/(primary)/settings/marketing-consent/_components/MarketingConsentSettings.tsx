'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AgreementApi } from '@/api/agreement/agreement.api';
import type { AgreementAction } from '@/api/agreement/types';
import { Button } from '@/components/ui/Button/Button';
import { ROUTES } from '@/constants/routes';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import useModalStore from '@/store/modalStore';

interface MarketingConsentSettingsProps {
  documentContent: string;
}

const AGREEMENT_STATUS_QUERY_KEY = ['agreements', 'status'] as const;

export function MarketingConsentSettings({
  documentContent,
}: MarketingConsentSettingsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isLoggedIn, isLoading: isAuthLoading } = useAuthSession();
  const { handleCloseModal, handleModalState } = useModalStore();

  useEffect(() => {
    if (!isAuthLoading && !isLoggedIn) {
      router.replace(ROUTES.LOGIN);
    }
  }, [isAuthLoading, isLoggedIn, router]);

  const {
    data: status,
    isPending: isStatusPending,
    isError: isStatusError,
    refetch,
  } = useQuery({
    queryKey: AGREEMENT_STATUS_QUERY_KEY,
    queryFn: async () => {
      const response = await AgreementApi.getStatus();
      return response.data;
    },
    enabled: !isAuthLoading && isLoggedIn,
    retry: false,
  });

  const submitMutation = useMutation({
    mutationFn: (action: AgreementAction) =>
      AgreementApi.submit({
        agreements: [
          {
            type: 'MARKETING',
            action,
            content: documentContent,
            inputContext: 'INDIVIDUAL',
          },
        ],
      }),
    onSuccess: (response, action) => {
      queryClient.setQueryData(AGREEMENT_STATUS_QUERY_KEY, response.data);
      handleModalState({
        isShowModal: true,
        type: 'ALERT',
        mainText:
          action === 'AGREE'
            ? '마케팅 정보 수신에 동의했습니다.'
            : '마케팅 정보 수신 동의를 철회했습니다.',
        subText: '',
      });
    },
    onError: () => {
      handleModalState({
        isShowModal: true,
        type: 'ALERT',
        mainText: '동의 상태를 변경하지 못했습니다.',
        subText: '잠시 후 다시 시도해주세요.',
      });
    },
  });

  const marketingStatus = status?.items.find(
    (item) => item.type === 'MARKETING',
  );
  const isAgreed = marketingStatus?.agreed === true;

  const handleAgreementChange = (action: AgreementAction) => {
    const isRevoke = action === 'REVOKE';

    handleModalState({
      isShowModal: true,
      type: 'CONFIRM',
      mainText: isRevoke
        ? '마케팅 정보 수신 동의를 철회할까요?'
        : '마케팅 정보 수신에 동의할까요?',
      subText: isRevoke
        ? '철회하면 이벤트와 혜택 안내를 받을 수 없어요.'
        : '이벤트와 혜택 등 마케팅 정보를 받을 수 있어요.',
      confirmBtnName: isRevoke ? '철회하기' : '동의하기',
      cancelBtnName: isRevoke ? '계속 수신하기' : '취소',
      handleConfirm: () => {
        handleCloseModal();
        submitMutation.mutate(action);
      },
      handleCancel: handleCloseModal,
    });
  };

  if (isAuthLoading || !isLoggedIn) {
    return (
      <div className="px-5 py-10 text-center text-14 text-fg-neutral-muted">
        로그인 정보를 확인하고 있어요.
      </div>
    );
  }

  return (
    <section className="px-5 pb-safe-lg pt-8">
      <h1 className="text-20 font-bold">수신 동의 현황</h1>
      <p className="mt-2 text-13 leading-5 text-fg-neutral-muted">
        마케팅 정보 수신 여부를 확인하고 변경할 수 있어요.
      </p>

      {isStatusError ? (
        <div className="mt-8 rounded-xl border border-stroke-neutral-subtle bg-bg-neutral-weak px-4 py-6 text-center">
          <p className="text-14 text-fg-neutral-muted">
            동의 상태를 불러오지 못했습니다.
          </p>
          <button
            className="mt-4 text-14 font-bold text-fg-brand underline underline-offset-4"
            onClick={() => refetch()}
            type="button"
          >
            다시 시도
          </button>
        </div>
      ) : (
        <>
          <div className="mt-8 overflow-hidden rounded-xl border border-stroke-neutral-subtle">
            <table className="w-full text-14">
              <caption className="sr-only">마케팅 정보 수신 동의 현황</caption>
              <tbody className="divide-y divide-stroke-neutral-subtle">
                <tr>
                  <th className="w-32 bg-bg-neutral-weak px-4 py-4 text-left font-medium text-fg-neutral-muted">
                    수신 동의 여부
                  </th>
                  <td className="px-4 py-4 font-bold">
                    {isStatusPending ? (
                      <span className="text-fg-neutral-muted">조회 중</span>
                    ) : (
                      <span
                        className={
                          isAgreed ? 'text-fg-brand' : 'text-fg-neutral-muted'
                        }
                      >
                        {isAgreed ? '동의함' : '동의하지 않음'}
                      </span>
                    )}
                  </td>
                </tr>
                <tr>
                  <th className="w-32 bg-bg-neutral-weak px-4 py-4 text-left font-medium text-fg-neutral-muted">
                    동의 일자
                  </th>
                  <td className="px-4 py-4 text-fg-neutral-muted">정보 없음</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-10">
            {isAgreed ? (
              <Button
                btnName={submitMutation.isPending ? '처리 중...' : '동의 철회'}
                btnStyles="border border-stroke-neutral-weak bg-bg-layer-default active:bg-bg-layer-default-pressed"
                btnTextStyles="text-15 font-bold text-fg-neutral-muted"
                disabled={isStatusPending || submitMutation.isPending}
                onClick={() => handleAgreementChange('REVOKE')}
              />
            ) : (
              <Button
                btnName={
                  submitMutation.isPending
                    ? '처리 중...'
                    : '마케팅 정보 수신 동의'
                }
                disabled={isStatusPending || submitMutation.isPending}
                onClick={() => handleAgreementChange('AGREE')}
              />
            )}
          </div>
        </>
      )}
    </section>
  );
}

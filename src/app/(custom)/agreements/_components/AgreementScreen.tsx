'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AgreementApi } from '@/api/agreement/agreement.api';
import type {
  AgreementInputContext,
  AgreementStatusItem,
  AgreementType,
} from '@/api/agreement/types';
import { Button } from '@/components/ui/Button/Button';
import { ROUTES } from '@/constants/routes';
import useModalStore from '@/store/modalStore';
import { getReturnToUrl } from '@/utils/loginRedirect';

type AgreementRequirement = 'all' | 'optional' | 'required';
type AgreementState = Record<AgreementType, boolean>;
type AgreementInputContexts = Record<AgreementType, AgreementInputContext>;

interface AgreementScreenProps {
  documentContents: Record<AgreementType, string>;
}

const AGREEMENT_STATUS_QUERY_KEY = ['agreements', 'status'] as const;

const AGREEMENT_TYPES: AgreementType[] = [
  'TERMS_OF_SERVICE',
  'PRIVACY_COLLECTION_USE',
  'MARKETING',
];

const createEmptyAgreementState = (): AgreementState => ({
  TERMS_OF_SERVICE: false,
  PRIVACY_COLLECTION_USE: false,
  MARKETING: false,
});

const createIndividualInputContexts = (): AgreementInputContexts => ({
  TERMS_OF_SERVICE: 'INDIVIDUAL',
  PRIVACY_COLLECTION_USE: 'INDIVIDUAL',
  MARKETING: 'INDIVIDUAL',
});

const createAgreementState = (items: AgreementStatusItem[]): AgreementState =>
  items.reduce<AgreementState>((state, item) => {
    state[item.type] = item.agreed;
    return state;
  }, createEmptyAgreementState());

interface AgreementCheckboxProps {
  checked: boolean;
  disabled?: boolean;
  href?: string;
  id: string;
  label: string;
  onChange: (checked: boolean) => void;
  requirement: AgreementRequirement;
}

function AgreementCheckbox({
  checked,
  disabled = false,
  href,
  id,
  label,
  onChange,
  requirement,
}: AgreementCheckboxProps) {
  const prefix =
    requirement === 'required'
      ? '[필수] '
      : requirement === 'optional'
        ? '[선택] '
        : '';

  return (
    <div className="flex items-center gap-3 py-4">
      <label
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-3"
        htmlFor={id}
      >
        <input
          checked={checked}
          className="peer sr-only"
          disabled={disabled}
          id={id}
          onChange={(event) => onChange(event.target.checked)}
          type="checkbox"
        />
        <span
          aria-hidden="true"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-stroke-neutral-weak text-13 font-bold text-fg-brand transition-colors peer-checked:border-stroke-brand-solid peer-checked:bg-bg-brand-weak peer-focus-visible:ring-2 peer-focus-visible:ring-stroke-focus-ring"
        >
          {checked ? '✓' : ''}
        </span>
        <span
          className={`min-w-0 text-14 text-fg-neutral ${
            requirement === 'all' ? 'font-bold' : 'font-medium'
          }`}
        >
          {prefix}
          {label}
        </span>
      </label>
      {href && (
        <Link
          className="shrink-0 text-13 font-medium text-fg-brand underline underline-offset-4"
          href={href}
        >
          내용 보기
        </Link>
      )}
    </div>
  );
}

export function AgreementScreen({ documentContents }: AgreementScreenProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { handleModalState } = useModalStore();
  const [agreements, setAgreements] = useState(createEmptyAgreementState);
  const [inputContexts, setInputContexts] = useState(
    createIndividualInputContexts,
  );
  const [isInitialized, setIsInitialized] = useState(false);
  const initialAgreementsRef = useRef<AgreementState>(
    createEmptyAgreementState(),
  );
  const hasHandledStatusRef = useRef(false);
  const hasShownStatusErrorRef = useRef(false);

  const { data: status, isError: isStatusError } = useQuery({
    queryKey: AGREEMENT_STATUS_QUERY_KEY,
    queryFn: async () => {
      const response = await AgreementApi.getStatus();
      return response.data;
    },
    retry: false,
  });

  const submitMutation = useMutation({
    mutationFn: AgreementApi.submit,
    onSuccess: (response) => {
      queryClient.setQueryData(AGREEMENT_STATUS_QUERY_KEY, response.data);
      router.replace(getReturnToUrl());
    },
    onError: () => {
      handleModalState({
        isShowModal: true,
        mainText: '동의 처리에 실패했습니다.',
        subText: '잠시 후 다시 시도해주세요.',
      });
    },
  });

  useEffect(() => {
    if (!status || hasHandledStatusRef.current) return;

    hasHandledStatusRef.current = true;

    if (status.eligible) {
      router.replace(getReturnToUrl());
      return;
    }

    const initialAgreements = createAgreementState(status.items);
    initialAgreementsRef.current = initialAgreements;
    setAgreements(initialAgreements);
    setIsInitialized(true);
  }, [router, status]);

  useEffect(() => {
    if (!isStatusError || hasShownStatusErrorRef.current) return;

    hasShownStatusErrorRef.current = true;
    handleModalState({
      isShowModal: true,
      mainText: '동의 상태를 불러오지 못했습니다.',
      subText: '잠시 후 다시 시도해주세요.',
    });
  }, [handleModalState, isStatusError]);

  const isAllAgreed = AGREEMENT_TYPES.every((type) => agreements[type]);
  const canContinue =
    agreements.TERMS_OF_SERVICE && agreements.PRIVACY_COLLECTION_USE;

  const handleAgreementChange = (type: AgreementType, checked: boolean) => {
    setAgreements((current) => ({ ...current, [type]: checked }));
    setInputContexts((current) => ({
      ...current,
      [type]: 'INDIVIDUAL',
    }));
  };

  const handleAllAgreementChange = (checked: boolean) => {
    setAgreements({
      TERMS_OF_SERVICE: checked,
      PRIVACY_COLLECTION_USE: checked,
      MARKETING: checked,
    });
    setInputContexts({
      TERMS_OF_SERVICE: 'BULK',
      PRIVACY_COLLECTION_USE: 'BULK',
      MARKETING: 'BULK',
    });
  };

  const handleSubmit = () => {
    submitMutation.mutate({
      agreements: AGREEMENT_TYPES.filter(
        (type) => agreements[type] !== initialAgreementsRef.current[type],
      ).map((type) => ({
        type,
        action: agreements[type] ? 'AGREE' : 'REVOKE',
        content: documentContents[type],
        inputContext: inputContexts[type],
      })),
    });
  };

  const isInteractionDisabled = !isInitialized || submitMutation.isPending;

  return (
    <main className="content-container flex min-h-safe-screen flex-col bg-bg-layer-default px-5 pb-safe-lg pt-safe text-fg-neutral">
      <section className="pt-8">
        <p className="text-13 font-bold text-fg-brand">보틀노트</p>
        <h1 className="mt-3 text-27 font-extrabold leading-9">
          서비스 이용을 위해
          <br />
          동의가 필요해요
        </h1>
        <p className="mt-3 text-14 leading-6 text-fg-neutral-muted">
          약관과 개인정보 처리 내용을 확인한 후 동의해주세요.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-stroke-neutral-subtle bg-bg-neutral-weak px-4 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-14 font-bold">개인정보 처리방침</h2>
            <p className="mt-1 text-12 leading-5 text-fg-neutral-muted">
              개인정보를 어떻게 처리하는지 언제든지 확인할 수 있어요.
            </p>
          </div>
          <Link
            className="shrink-0 text-13 font-medium text-fg-brand underline underline-offset-4"
            href={ROUTES.LEGAL.PRIVACY_POLICY}
          >
            내용 보기
          </Link>
        </div>
      </section>

      <section
        aria-label="서비스 이용 동의 항목"
        className="mt-6 divide-y divide-stroke-neutral-subtle border-y border-stroke-neutral-subtle"
      >
        <AgreementCheckbox
          checked={isAllAgreed}
          disabled={isInteractionDisabled}
          id="agreement-all"
          label="전체 동의"
          onChange={handleAllAgreementChange}
          requirement="all"
        />
        <AgreementCheckbox
          checked={agreements.TERMS_OF_SERVICE}
          disabled={isInteractionDisabled}
          href={ROUTES.LEGAL.TERMS}
          id="terms"
          label="이용약관 동의"
          onChange={(checked) =>
            handleAgreementChange('TERMS_OF_SERVICE', checked)
          }
          requirement="required"
        />
        <AgreementCheckbox
          checked={agreements.PRIVACY_COLLECTION_USE}
          disabled={isInteractionDisabled}
          href={ROUTES.LEGAL.PRIVACY_COLLECTION_USE}
          id="privacy-collection-use"
          label="개인정보 수집·이용 동의"
          onChange={(checked) =>
            handleAgreementChange('PRIVACY_COLLECTION_USE', checked)
          }
          requirement="required"
        />
        <AgreementCheckbox
          checked={agreements.MARKETING}
          disabled={isInteractionDisabled}
          href={ROUTES.LEGAL.MARKETING_CONSENT}
          id="marketing"
          label="마케팅 정보 수신 동의"
          onChange={(checked) => handleAgreementChange('MARKETING', checked)}
          requirement="optional"
        />
      </section>

      <div className="mt-auto pt-10">
        <Button
          btnName={
            submitMutation.isPending ? '처리 중...' : '동의하고 시작하기'
          }
          disabled={!canContinue || isInteractionDisabled}
          onClick={handleSubmit}
        />
      </div>
    </main>
  );
}

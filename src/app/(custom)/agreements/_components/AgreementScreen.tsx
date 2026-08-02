'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button/Button';
import { ROUTES } from '@/constants/routes';

interface AgreementCheckboxProps {
  checked: boolean;
  href: string;
  id: string;
  isRequired: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}

function AgreementCheckbox({
  checked,
  href,
  id,
  isRequired,
  label,
  onChange,
}: AgreementCheckboxProps) {
  return (
    <div className="flex items-center gap-3 py-4">
      <label
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-3"
        htmlFor={id}
      >
        <input
          checked={checked}
          className="peer sr-only"
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
        <span className="min-w-0 text-14 font-medium text-fg-neutral">
          {isRequired ? '[필수] ' : '[선택] '}
          {label}
        </span>
      </label>
      <Link
        className="shrink-0 text-13 font-medium text-fg-brand underline underline-offset-4"
        href={href}
      >
        내용 보기
      </Link>
    </div>
  );
}

export function AgreementScreen() {
  const [isTermsAgreed, setIsTermsAgreed] = useState(false);
  const [isPrivacyCollectionUseAgreed, setIsPrivacyCollectionUseAgreed] =
    useState(false);
  const [isMarketingAgreed, setIsMarketingAgreed] = useState(false);
  const [isPreviewSubmitted, setIsPreviewSubmitted] = useState(false);

  const canContinue = isTermsAgreed && isPrivacyCollectionUseAgreed;

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
          checked={isTermsAgreed}
          href={ROUTES.LEGAL.TERMS}
          id="terms"
          isRequired
          label="이용약관 동의"
          onChange={setIsTermsAgreed}
        />
        <AgreementCheckbox
          checked={isPrivacyCollectionUseAgreed}
          href={ROUTES.LEGAL.PRIVACY_COLLECTION_USE}
          id="privacy-collection-use"
          isRequired
          label="개인정보 수집·이용 동의"
          onChange={setIsPrivacyCollectionUseAgreed}
        />
        <AgreementCheckbox
          checked={isMarketingAgreed}
          href={ROUTES.LEGAL.MARKETING_CONSENT}
          id="marketing"
          isRequired={false}
          label="마케팅 정보 수신 동의"
          onChange={setIsMarketingAgreed}
        />
      </section>

      <p className="mt-4 text-12 leading-5 text-fg-neutral-muted">
        마케팅 정보 수신 동의는 선택 사항이며, 동의하지 않아도 기본 서비스
        이용에는 제한이 없습니다.
      </p>

      <div className="mt-auto pt-10">
        <Button
          btnName="동의하고 시작하기"
          disabled={!canContinue}
          onClick={() => setIsPreviewSubmitted(true)}
        />
        {isPreviewSubmitted && (
          <p
            className="mt-3 text-center text-12 text-fg-neutral-muted"
            role="status"
          >
            화면 검토용 단계입니다. 실제 동의 기록은 API 연동 단계에서
            저장됩니다.
          </p>
        )}
      </div>
    </main>
  );
}

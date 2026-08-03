import { PropsWithChildren } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { AgreementApi } from '@/api/agreement/agreement.api';
import type { AgreementStatusResponse } from '@/api/agreement/types';
import { AgreementScreen } from './AgreementScreen';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/api/agreement/agreement.api', () => ({
  AgreementApi: {
    getStatus: jest.fn(),
    submit: jest.fn(),
  },
}));

const documentContents = {
  TERMS_OF_SERVICE: '이용약관 원문',
  PRIVACY_COLLECTION_USE: '개인정보 수집·이용 원문',
  MARKETING: '마케팅 동의 원문',
} as const;

const agreementStatus: AgreementStatusResponse = {
  eligible: false,
  items: [
    { type: 'TERMS_OF_SERVICE', required: true, agreed: false },
    { type: 'PRIVACY_COLLECTION_USE', required: true, agreed: false },
    { type: 'MARKETING', required: false, agreed: false },
  ],
};

const createResponse = (data: AgreementStatusResponse) => ({
  success: true,
  code: 200,
  data,
  errors: [],
  meta: {
    serverEncoding: 'UTF-8',
    serverVersion: 'test',
    serverPathVersion: 'v2',
    serverResponseTime: '2026-08-03T00:00:00',
  },
});

describe('AgreementScreen', () => {
  const getStatusMock = jest.mocked(AgreementApi.getStatus);
  const submitMock = jest.mocked(AgreementApi.submit);
  const routerReplace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    (useRouter as jest.Mock).mockReturnValue({ replace: routerReplace });
    getStatusMock.mockResolvedValue(createResponse(agreementStatus));
    submitMock.mockResolvedValue(
      createResponse({
        ...agreementStatus,
        eligible: true,
        items: agreementStatus.items.map((item) =>
          item.required ? { ...item, agreed: true } : item,
        ),
      }),
    );
  });

  const renderAgreementScreen = async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    render(<AgreementScreen documentContents={documentContents} />, {
      wrapper,
    });

    await waitFor(() => {
      expect(screen.getByLabelText('[필수] 이용약관 동의')).toBeEnabled();
    });
  };

  it('개인정보 처리방침은 보기 링크만 표시하고, 필수·선택 동의 항목을 구분한다', async () => {
    await renderAgreementScreen();

    expect(screen.getByText('개인정보 처리방침')).toBeInTheDocument();
    expect(screen.getAllByText('내용 보기')).toHaveLength(4);
    expect(screen.getByLabelText('전체 동의')).not.toBeChecked();
    expect(screen.getByLabelText('[필수] 이용약관 동의')).not.toBeChecked();
    expect(
      screen.getByLabelText('[필수] 개인정보 수집·이용 동의'),
    ).not.toBeChecked();
    expect(
      screen.getByLabelText('[선택] 마케팅 정보 수신 동의'),
    ).not.toBeChecked();
  });

  it('각 약관 링크를 제공한다', async () => {
    await renderAgreementScreen();

    const links = screen.getAllByRole('link', { name: '내용 보기' });
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/privacy-policy',
      '/terms',
      '/privacy-collection-use',
      '/marketing-consent',
    ]);
  });

  it('필수 동의 두 개를 선택해야 시작 버튼이 활성화된다', async () => {
    await renderAgreementScreen();

    const submitButton = screen.getByRole('button', {
      name: '동의하고 시작하기',
    });
    fireEvent.click(screen.getByLabelText('[필수] 이용약관 동의'));

    expect(submitButton).toBeDisabled();

    fireEvent.click(screen.getByLabelText('[필수] 개인정보 수집·이용 동의'));

    expect(submitButton).toBeEnabled();
  });

  it('전체 동의는 모든 항목을 함께 선택하고 해제한다', async () => {
    await renderAgreementScreen();

    const allAgreement = screen.getByLabelText('전체 동의');
    const submitButton = screen.getByRole('button', {
      name: '동의하고 시작하기',
    });

    fireEvent.click(allAgreement);

    expect(allAgreement).toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: /이용약관 동의/ }),
    ).toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: /개인정보 수집·이용 동의/ }),
    ).toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: /마케팅 정보 수신 동의/ }),
    ).toBeChecked();
    expect(submitButton).toBeEnabled();

    fireEvent.click(allAgreement);

    expect(allAgreement).not.toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: /이용약관 동의/ }),
    ).not.toBeChecked();
    expect(submitButton).toBeDisabled();
  });

  it('필수 동의 원문과 개별 선택 방식을 제출하고 기존 경로로 이동한다', async () => {
    await renderAgreementScreen();

    fireEvent.click(screen.getByLabelText('[필수] 이용약관 동의'));
    fireEvent.click(screen.getByLabelText('[필수] 개인정보 수집·이용 동의'));
    fireEvent.click(screen.getByRole('button', { name: '동의하고 시작하기' }));

    await waitFor(() => {
      expect(submitMock).toHaveBeenCalledWith({
        agreements: [
          {
            type: 'TERMS_OF_SERVICE',
            action: 'AGREE',
            content: '이용약관 원문',
            inputContext: 'INDIVIDUAL',
          },
          {
            type: 'PRIVACY_COLLECTION_USE',
            action: 'AGREE',
            content: '개인정보 수집·이용 원문',
            inputContext: 'INDIVIDUAL',
          },
        ],
      });
    });
    expect(routerReplace).toHaveBeenCalledWith('/');
  });
});

import { PropsWithChildren } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { AgreementApi } from '@/api/agreement/agreement.api';
import type { AgreementStatusResponse } from '@/api/agreement/types';
import { LOGIN_RETURN_TO_KEY, setReturnToUrl } from '@/utils/loginRedirect';
import { AgreementScreen } from './AgreementScreen';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
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
    jest
      .mocked(useSearchParams)
      .mockReturnValue(
        new URLSearchParams() as ReturnType<typeof useSearchParams>,
      );
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

  it.each([
    ['returnTo=/explore%3Ftab%3Dreview', '/history', '/explore?tab=review'],
    ['', '/history', '/history'],
    ['returnTo=https%3A%2F%2Fevil.com', '/history', '/'],
  ])(
    '동의 완료 후 쿼리 %s와 저장소 %s에 따라 %s로 복귀한다',
    async (query, stored, expected) => {
      setReturnToUrl(stored);
      jest
        .mocked(useSearchParams)
        .mockReturnValue(
          new URLSearchParams(query) as ReturnType<typeof useSearchParams>,
        );
      await renderAgreementScreen();
      fireEvent.click(screen.getByLabelText('전체 동의'));
      fireEvent.click(
        screen.getByRole('button', { name: '동의하고 시작하기' }),
      );
      await waitFor(() => expect(routerReplace).toHaveBeenCalledWith(expected));
      expect(routerReplace).toHaveBeenCalledTimes(1);
      expect(sessionStorage.getItem(LOGIN_RETURN_TO_KEY)).toBeNull();
    },
  );

  it('저장소가 없어도 이미 동의한 사용자는 URL의 목적지로 복귀한다', async () => {
    jest.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams({
        returnTo: '/whiskey-mbti?result=INTJ-A',
      }) as ReturnType<typeof useSearchParams>,
    );
    getStatusMock.mockResolvedValueOnce(
      createResponse({ ...agreementStatus, eligible: true }),
    );
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <AgreementScreen documentContents={documentContents} />
      </QueryClientProvider>,
    );
    await waitFor(() =>
      expect(routerReplace).toHaveBeenCalledWith('/whiskey-mbti?result=INTJ-A'),
    );
    expect(routerReplace).toHaveBeenCalledTimes(1);
  });

  it('동의 제출 실패 시 목적지를 유지하고 재시도 후 복귀한다', async () => {
    setReturnToUrl('/history');
    submitMock.mockRejectedValueOnce(new Error('temporary failure'));
    await renderAgreementScreen();
    fireEvent.click(screen.getByLabelText('전체 동의'));
    const button = screen.getByRole('button', { name: '동의하고 시작하기' });
    fireEvent.click(button);
    await waitFor(() => expect(button).toBeEnabled());
    expect(routerReplace).not.toHaveBeenCalled();
    expect(sessionStorage.getItem(LOGIN_RETURN_TO_KEY)).toBe('/history');
    fireEvent.click(button);
    await waitFor(() => expect(routerReplace).toHaveBeenCalledWith('/history'));
    expect(sessionStorage.getItem(LOGIN_RETURN_TO_KEY)).toBeNull();
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

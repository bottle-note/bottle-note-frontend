import { act, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MfdsApi } from '@/api/mfds/mfds.api';
import type { MfdsAlcoholDetail } from '@/api/mfds/types';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import { trackGA4Event } from '@/utils/analytics/ga4';
import ImportClearanceDetailClient from './ImportClearanceDetailClient';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ back: jest.fn(), push: jest.fn() }),
}));
jest.mock('@/hooks/auth/useAuthSession', () => ({
  useAuthSession: jest.fn(),
}));
jest.mock('@/hooks/useLoginBridge', () => ({
  useLoginBridge: () => ({ bridgeToLogin: jest.fn() }),
}));
jest.mock('@/utils/analytics/ga4', () => ({
  trackGA4Event: jest.fn(),
}));

const declaration: MfdsAlcoholDetail = {
  id: 123,
  rcno: '2026-123',
  processedDate: '2026-09-10',
  alcoholId: null,
  alcoholNameKo: null,
  alcoholNameEn: null,
  baseProductNameKo: '스프링뱅크',
  baseProductNameEn: 'Springbank',
  skuDisplayNameKo: null,
  skuDisplayNameEn: null,
  alcoholCategoryKo: '위스키',
  alcoholCategoryEn: 'Whisky',
  exportCountryAlpha2: 'GB',
  exportCountryNameKo: '영국',
  volumeMl: 700,
  abvPercent: 46,
  importerId: null,
  importerBaseName: null,
  unitVolumeMl: null,
  packageCount: null,
  ageYears: 10,
  vintageYear: null,
  editionName: null,
  caskNumber: null,
  batchNumber: null,
  expiryStart: null,
  expiryEnd: null,
  manufacturerName: '기존 제조사',
  manufactureCountryNameKo: null,
  importer: null,
};

it('초기 공개 본문을 보여주고 브라우저 재조회 후 갱신하며 게스트 안내를 유지한다', async () => {
  const auth = jest.mocked(useAuthSession);
  auth.mockReturnValue({ isLoading: true, isLoggedIn: false } as ReturnType<
    typeof useAuthSession
  >);

  let resolveDetails!: (
    value: Awaited<ReturnType<typeof MfdsApi.getAlcohol>>,
  ) => void;
  const getAlcohol = jest.spyOn(MfdsApi, 'getAlcohol').mockImplementation(
    () =>
      new Promise((resolve) => {
        resolveDetails = resolve;
      }),
  );
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const view = () => (
    <QueryClientProvider client={queryClient}>
      <ImportClearanceDetailClient id="123" initialData={declaration} />
    </QueryClientProvider>
  );
  const { rerender } = render(view());

  expect(screen.getByText('스프링뱅크')).toBeInTheDocument();
  expect(screen.getByText('기존 제조사')).toBeInTheDocument();
  expect(screen.queryByText('로그인하고 보기')).not.toBeInTheDocument();
  await waitFor(() => expect(getAlcohol).toHaveBeenCalledWith('123'));

  await act(async () => {
    resolveDetails({
      success: true,
      code: 200,
      data: { ...declaration, manufacturerName: '갱신된 제조사' },
      errors: [],
      meta: {
        serverEncoding: 'UTF-8',
        serverVersion: 'test',
        serverPathVersion: 'v1',
        serverResponseTime: '2026-10-05T00:00:00Z',
      },
    });
  });
  expect(await screen.findByText('갱신된 제조사')).toBeInTheDocument();

  auth.mockReturnValue({ isLoading: false, isLoggedIn: false } as ReturnType<
    typeof useAuthSession
  >);
  rerender(view());
  expect(screen.getByText('로그인하고 보기')).toBeInTheDocument();
  await waitFor(() =>
    expect(trackGA4Event).toHaveBeenCalledWith('view_import_clearance_detail', {
      declaration_id: '123',
      access_state: 'guest',
      match_status: 'unmatched',
    }),
  );
  expect(getAlcohol).toHaveBeenCalledTimes(1);
});

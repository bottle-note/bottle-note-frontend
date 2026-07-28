import { apiClient } from '@/shared/api/apiClient';
import { CurationV2Api } from './curation-v2.api';
import { CURATION_V2_SPEC_CODES } from './constants';

jest.mock('@/shared/api/apiClient', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

const mockGet = apiClient.get as jest.Mock;

const feedResponse = {
  success: true,
  code: 200,
  data: {
    items: [],
    pageable: {
      currentCursor: 0,
      cursor: 10,
      pageSize: 10,
      hasNext: false,
    },
  },
  errors: [],
  meta: {
    serverEncoding: 'UTF-8',
    serverVersion: '1.0.0',
    serverPathVersion: 'v2',
    serverResponseTime: '2026-07-28T00:00:00',
  },
};

describe('CurationV2Api.getFeed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue(feedResponse);
  });

  it('복수 code를 반복 쿼리 파라미터로 직렬화한다', async () => {
    await CurationV2Api.getFeed({
      cursor: 0,
      pageSize: 10,
      code: [
        CURATION_V2_SPEC_CODES.PROGRAM,
        CURATION_V2_SPEC_CODES.WHISKY_TASTING_EVENT,
      ],
    });

    expect(mockGet).toHaveBeenCalledWith(
      '/curations/feed?cursor=0&size=10&code=PROGRAM&code=WHISKY_TASTING_EVENT',
      { authRequired: false, baseUrl: 'bottle-api/v2' },
    );
  });

  it('빈 code 배열은 요청 전에 거부한다', async () => {
    await expect(
      CurationV2Api.getFeed({
        code: [],
      }),
    ).rejects.toThrow('At least one curation spec code is required.');

    expect(mockGet).not.toHaveBeenCalled();
  });
});

import { apiClient } from '@/shared/api/apiClient';
import { CurationV2Api } from './curation-v2.api';
import { CURATION_V2_SPEC_CODES } from './constants';

jest.mock('@/shared/api/apiClient', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

const mockGet = apiClient.get as jest.Mock;
const getSearchParams = () =>
  new URLSearchParams((mockGet.mock.calls[0][0] as string).split('?')[1]);

const feedResponse = {
  success: true,
  code: 200,
  data: { items: [] },
  errors: [],
  meta: {
    serverEncoding: 'UTF-8',
    serverVersion: '1.0.0',
    serverPathVersion: 'v2',
    serverResponseTime: '2026-07-28T00:00:00',
    pagination: { hasNext: false, nextCursor: null },
  },
};

describe('CurationV2Api.getFeed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue(feedResponse);
  });

  it('기존 v2 feed 주소로 첫 요청을 보내며 cursor=0/pageSize를 사용하지 않는다', async () => {
    await CurationV2Api.getFeed({
      size: 10,
      code: [
        CURATION_V2_SPEC_CODES.RECOMMENDED_WHISKY,
        CURATION_V2_SPEC_CODES.WHISKY_PAIRING,
      ],
    } as never);

    expect(mockGet).toHaveBeenCalledWith(
      expect.stringContaining('/curations/feed?'),
      { authRequired: false, baseUrl: 'bottle-api/v2' },
    );
    expect(getSearchParams().get('cursor')).toBeNull();
    expect(getSearchParams().get('size')).toBe('10');
    expect(getSearchParams().has('pageSize')).toBe(false);
    expect(getSearchParams().getAll('code')).toEqual([
      'RECOMMENDED_WHISKY',
      'WHISKY_PAIRING',
    ]);
  });

  it('opaque cursor를 변형 없이 전달한다', async () => {
    const cursor = 'signed+cursor/with?symbols=';

    await CurationV2Api.getFeed({
      cursor,
      size: 10,
      code: [CURATION_V2_SPEC_CODES.RECOMMENDED_WHISKY],
    } as never);

    expect(getSearchParams().get('cursor')).toBe(cursor);
  });

  it('빈 code 배열은 요청 전에 거부한다', async () => {
    await expect(CurationV2Api.getFeed({ code: [] } as never)).rejects.toThrow(
      'At least one curation spec code is required.',
    );

    expect(mockGet).not.toHaveBeenCalled();
  });
});

describe('CurationV2Api.getDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue(feedResponse);
  });

  it('v2 큐레이션 상세 경로를 사용한다', async () => {
    await CurationV2Api.getDetail(12);

    expect(mockGet).toHaveBeenCalledWith('/curations/12', {
      authRequired: false,
      baseUrl: 'bottle-api/v2',
    });
  });
});

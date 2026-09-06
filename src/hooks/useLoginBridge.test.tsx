import { act, renderHook } from '@testing-library/react';

import { useLoginBridge } from './useLoginBridge';

const mockPush = jest.fn();
const mockHandleLoginModal = jest.fn();
const mockSetLoginTrigger = jest.fn();
const mockTrackGA4Event = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/store/modalStore', () => ({
  __esModule: true,
  default: () => ({ handleLoginModal: mockHandleLoginModal }),
}));

jest.mock('@/utils/loginTrigger', () => ({
  setLoginTrigger: (...args: unknown[]) => mockSetLoginTrigger(...args),
}));

jest.mock('@/utils/analytics/ga4', () => ({
  trackGA4Event: (...args: unknown[]) => mockTrackGA4Event(...args),
}));

describe('useLoginBridge', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('직접 로그인 액션은 모달 없이 returnTo를 포함한 로그인 페이지로 이동한다', () => {
    const { result } = renderHook(() => useLoginBridge());

    act(() => {
      result.current.navigateToLogin(
        'whisky_detail',
        '/search/all/1?source=explore',
      );
    });

    expect(mockSetLoginTrigger).toHaveBeenCalledWith('whisky_detail');
    expect(mockTrackGA4Event).toHaveBeenCalledWith('login_prompt_shown', {
      trigger: 'whisky_detail',
    });
    expect(mockHandleLoginModal).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith(
      '/login?returnTo=%2Fsearch%2Fall%2F1%3Fsource%3Dexplore',
    );
  });

  it('기존 bridge 액션은 로그인 모달 흐름을 유지한다', () => {
    const { result } = renderHook(() => useLoginBridge());

    act(() => {
      result.current.bridgeToLogin('rating');
    });

    expect(mockSetLoginTrigger).toHaveBeenCalledWith('rating');
    expect(mockTrackGA4Event).toHaveBeenCalledWith('login_prompt_shown', {
      trigger: 'rating',
    });
    expect(mockHandleLoginModal).toHaveBeenCalledTimes(1);
    expect(mockPush).not.toHaveBeenCalled();
  });
});

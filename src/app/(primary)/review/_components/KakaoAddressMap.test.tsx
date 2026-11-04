import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { searchKakaoPlaces } from '@/lib/kakao/kakaoPlaces';
import { SearchHistoryService } from '@/lib/SearchHistoryService';
import useModalStore from '@/store/modalStore';
import type { KakaoPlace } from '@/types/Review';
import Modal from '@/components/ui/Modal/Modal';
import PageModal from '@/components/ui/Modal/PageModal';
import KakaoAddressMap from './KakaoAddressMap';

jest.mock('@/lib/kakao/kakaoPlaces', () => ({
  ...jest.requireActual('@/lib/kakao/kakaoPlaces'),
  searchKakaoPlaces: jest.fn(),
}));

const searchPlaces = jest.mocked(searchKakaoPlaces);
const place: KakaoPlace = {
  id: '123',
  place_name: '보틀 바',
  category_name: '음식점 > 술집 > 위스키바',
  category_group_code: 'FD6',
  category_group_name: '음식점',
  address_name: '서울 마포구 서교동 1',
  road_address_name: '서울 마포구 양화로 1',
  phone: '02-123-4567',
  place_url: 'https://place.map.kakao.com/123',
  distance: '',
  x: '126.9',
  y: '37.5',
};

function renderSearch() {
  const onSave = jest.fn();
  const result = render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <PageModal>
        <KakaoAddressMap handleSaveData={onSave} />
      </PageModal>
      <Modal />
      <div id="modal" />
    </QueryClientProvider>,
  );
  return { ...result, onSave };
}

function submit(value = '보틀') {
  fireEvent.change(screen.getByRole('textbox', { name: '장소 검색어' }), {
    target: { value },
  });
  fireEvent.click(screen.getByRole('button', { name: '장소 검색' }));
}

beforeEach(() => {
  jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
  searchPlaces.mockReset();
  searchPlaces.mockResolvedValue({ places: [place], hasNextPage: false });
  localStorage.clear();
  useModalStore.getState().handleCloseModal();
});

afterEach(() => jest.restoreAllMocks());

describe('리뷰 장소 검색', () => {
  it('검색 결과의 주소와 분류를 보여주고 선택한 장소를 전달한다', async () => {
    const { onSave } = renderSearch();
    submit();

    expect(await screen.findByText('위스키바')).toBeInTheDocument();
    expect(screen.getByText(place.road_address_name)).toBeInTheDocument();
    expect(screen.getByText(place.address_name)).toBeInTheDocument();
    expect(screen.getByText(place.phone)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '보틀 바 선택' }));
    expect(onSave).toHaveBeenCalledWith(place);
  });

  it('외부 데이터의 HTML과 이벤트 속성을 실행 가능한 요소로 만들지 않는다', async () => {
    const payload = '<img src=x onerror="alert(1)">';
    searchPlaces.mockResolvedValue({
      places: [
        {
          ...place,
          place_name: payload,
          category_name: payload,
          address_name: payload,
          road_address_name: payload,
          phone: payload,
        },
      ],
      hasNextPage: false,
    });
    const { container } = renderSearch();
    submit();

    expect(await screen.findAllByText(payload)).toHaveLength(5);
    expect(container.querySelector('[onerror]')).toBeNull();
    expect(container.querySelector('img[src="x"]')).toBeNull();
  });

  it('분류·지도 URL·도로명·전화가 없어도 지번과 장소 선택을 표시한다', async () => {
    searchPlaces.mockResolvedValue({
      places: [
        {
          ...place,
          category_name: '',
          place_url: '',
          road_address_name: '',
          phone: '',
        },
      ],
      hasNextPage: false,
    });
    renderSearch();
    submit();

    expect(
      await screen.findByRole('button', { name: '보틀 바 선택' }),
    ).toBeInTheDocument();
    expect(screen.getByText(place.address_name)).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByText('도로명')).not.toBeInTheDocument();
    expect(screen.queryByText('전화')).not.toBeInTheDocument();
  });

  it.each([
    'javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'https://place.map.kakao.com.evil.example/123',
    'https://place.map.kakao.com@evil.example/123',
    'https://user:password@place.map.kakao.com/123',
    "');alert(1);//",
  ])(
    '안전하지 않은 지도 URL을 링크로 표시하지 않는다: %s',
    async (place_url) => {
      searchPlaces.mockResolvedValue({
        places: [{ ...place, place_url }],
        hasNextPage: false,
      });
      renderSearch();
      submit();

      await screen.findByRole('button', { name: '보틀 바 선택' });
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    },
  );

  it.each(['http:', 'https:'])(
    '카카오 %s 지도 링크는 새 창으로 열고 장소를 선택하지 않는다',
    async (protocol) => {
      const place_url = `${protocol}//place.map.kakao.com/123`;
      searchPlaces.mockResolvedValue({
        places: [{ ...place, place_url }],
        hasNextPage: false,
      });
      const { onSave } = renderSearch();
      submit();

      const link = await screen.findByRole('link', {
        name: '보틀 바 지도 열기',
      });
      expect(link).toHaveAttribute('href', place_url);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      expect(link).not.toHaveAttribute('onclick');
      // jsdom의 새 창 이동은 막고 앱의 클릭 동작만 확인한다.
      link.addEventListener('click', (event) => event.preventDefault());
      fireEvent.click(link);
      expect(onSave).not.toHaveBeenCalled();
    },
  );

  it('최근 검색어를 누르면 해당 검색어로 검색하고 입력창에 반영한다', async () => {
    new SearchHistoryService('addressSearchHistory').save('위스키바');
    renderSearch();
    fireEvent.mouseDown(screen.getByText('위스키바'));

    expect(await screen.findByText(place.place_name)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('위스키바');
    expect(searchPlaces).toHaveBeenCalledWith('위스키바');
  });

  it('같은 검색어로 다시 검색하고 검색어 삭제 버튼으로 입력을 비운다', async () => {
    renderSearch();
    submit();
    await screen.findByText(place.place_name);
    submit();
    await waitFor(() => expect(searchPlaces).toHaveBeenCalledTimes(2));

    fireEvent.click(screen.getByRole('button', { name: '검색어 삭제' }));
    expect(screen.getByRole('textbox')).toHaveValue('');
  });

  it('검색을 바꾸면 먼저 요청한 늦은 응답이 최신 결과를 덮어쓰지 않는다', async () => {
    let resolveFirst!: (value: {
      places: KakaoPlace[];
      hasNextPage: boolean;
    }) => void;
    searchPlaces.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFirst = resolve;
        }),
    );
    searchPlaces.mockResolvedValueOnce({
      places: [{ ...place, id: '456', place_name: '새 장소' }],
      hasNextPage: false,
    });
    renderSearch();
    submit('첫 검색');
    await waitFor(() => expect(searchPlaces).toHaveBeenCalledWith('첫 검색'));
    submit('두 번째 검색');
    await screen.findByText('새 장소');

    await act(async () => {
      resolveFirst({ places: [place], hasNextPage: false });
    });
    await waitFor(() =>
      expect(screen.queryByText(place.place_name)).not.toBeInTheDocument(),
    );
    expect(screen.getByText('새 장소')).toBeInTheDocument();
  });

  it('빈 검색어는 요청하지 않고 입력 안내를 표시한다', () => {
    renderSearch();
    submit('   ');
    expect(searchPlaces).not.toHaveBeenCalled();
    expect(useModalStore.getState().state.mainText).toBe(
      '도로명 주소 혹은 상호명을 입력해주세요:)',
    );
  });

  it('결과가 없으면 안내하고 선택 가능한 결과를 표시하지 않는다', async () => {
    const alert = jest.spyOn(window, 'alert').mockImplementation(() => {});
    searchPlaces.mockResolvedValue({ places: [], hasNextPage: false });
    renderSearch();
    submit();

    await waitFor(() =>
      expect(alert).toHaveBeenCalledWith('검색 결과가 존재하지 않습니다.'),
    );
    expect(
      screen.queryByRole('button', { name: '보틀 바 선택' }),
    ).not.toBeInTheDocument();
  });

  it('검색 실패 시 오류 안내를 표시한다', async () => {
    searchPlaces.mockRejectedValue(new Error('KAKAO_PLACE_SEARCH_FAILED'));
    renderSearch();
    submit();

    await waitFor(() =>
      expect(useModalStore.getState().state.mainText).toBe(
        '검색 결과 중 오류가 발생했습니다.',
      ),
    );
  });

  it('빈 검색 안내를 확인으로 닫은 뒤 장소 검색을 계속할 수 있다', async () => {
    renderSearch();
    submit('   ');

    expect(
      await screen.findByText('도로명 주소 혹은 상호명을 입력해주세요:)'),
    ).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: '확인' }));
    expect(
      screen.queryByText('도로명 주소 혹은 상호명을 입력해주세요:)'),
    ).not.toBeInTheDocument();

    submit();
    expect(await screen.findByText(place.place_name)).toBeVisible();
  });

  it('검색 오류 안내를 닫고 다시 검색해 장소를 선택할 수 있다', async () => {
    searchPlaces.mockRejectedValueOnce(new Error('KAKAO_PLACE_SEARCH_FAILED'));
    const { onSave } = renderSearch();
    submit();

    expect(
      await screen.findByText('검색 결과 중 오류가 발생했습니다.'),
    ).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: '확인' }));
    submit();

    fireEvent.click(
      await screen.findByRole('button', { name: '보틀 바 선택' }),
    );
    expect(onSave).toHaveBeenCalledWith(place);
  });
});

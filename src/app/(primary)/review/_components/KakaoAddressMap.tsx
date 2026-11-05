import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { CircleX } from 'lucide-react';
import useModalStore from '@/store/modalStore';
import { KakaoPlace } from '@/types/Review';
import { SearchHistoryService } from '@/lib/SearchHistoryService';
import { searchKakaoPlaces, toPlaceLocation } from '@/lib/kakao/kakaoPlaces';
import RecentSearch from '@/components/feature/Search/RecentSearch';
import SearchIcon from 'public/icon/search-subcoral.svg';

interface Props {
  handleSaveData: (place: KakaoPlace) => void;
}

const searchHistoryKey = 'addressSearchHistory';
const searchHistory = new SearchHistoryService(searchHistoryKey);

function getMapUrl(value: string) {
  try {
    const url = new URL(value);
    if (
      (url.protocol === 'https:' || url.protocol === 'http:') &&
      url.hostname === 'place.map.kakao.com' &&
      !url.username &&
      !url.password
    ) {
      return url.href;
    }
  } catch {
    // 비어 있거나 유효하지 않은 URL은 링크로 표시하지 않는다.
  }
  return null;
}

function PlaceDetail({ label, value }: { label: string; value: string }) {
  return (
    <span className="mt-5 flex items-center">
      <span className="mr-10 flex w-50 shrink-0 items-center justify-center border-2 border-stroke-neutral-subtle text-12 text-fg-neutral-muted">
        {label}
      </span>
      <span className="text-12 text-fg-neutral">{value}</span>
    </span>
  );
}

function PlaceItem({ place, handleSaveData }: Props & { place: KakaoPlace }) {
  const { category } = toPlaceLocation(place);
  const mapUrl = getMapUrl(place.place_url);

  return (
    <li className="relative border-t border-stroke-neutral-subtle py-10 last:border-b">
      <button
        type="button"
        className="block w-full text-left"
        aria-label={`${place.place_name} 선택`}
        onClick={() => handleSaveData(place)}
      >
        <span className={`block ${mapUrl ? 'pr-32' : ''}`}>
          <span className="mr-10 text-14 font-bold text-fg-neutral">
            {place.place_name}
          </span>
          {category && (
            <span className="text-14 text-fg-neutral-muted">{category}</span>
          )}
        </span>
        {place.road_address_name && (
          <PlaceDetail label="도로명" value={place.road_address_name} />
        )}
        <PlaceDetail label="지번" value={place.address_name} />
        {place.phone && <PlaceDetail label="전화" value={place.phone} />}
      </button>
      {mapUrl && (
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute right-0 top-10 text-12 text-fg-brand"
          aria-label={`${place.place_name} 지도 열기`}
        >
          지도
        </a>
      )}
    </li>
  );
}

export default function KakaoAddressMap({ handleSaveData }: Props) {
  const { handleModalState } = useModalStore();
  const [searchText, setSearchText] = useState('');
  const [keyword, setKeyword] = useState('');
  const [isOnSearch, setIsOnSearch] = useState(true);
  const { data, dataUpdatedAt, error, errorUpdatedAt, refetch } = useQuery({
    queryKey: ['review', 'place-search', keyword],
    queryFn: () => searchKakaoPlaces(keyword),
    enabled: keyword.length > 0,
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (!data) return;
    if (data.places.length === 0) {
      alert('검색 결과가 존재하지 않습니다.');
      return;
    }
    setIsOnSearch(false);
  }, [data, dataUpdatedAt]);

  useEffect(() => {
    if (error) {
      handleModalState({
        isShowModal: true,
        mainText: '검색 결과 중 오류가 발생했습니다.',
      });
    }
  }, [error, errorUpdatedAt, handleModalState]);

  const searchPlaces = (value: string) => {
    const nextKeyword = value.trim();
    if (!nextKeyword) {
      handleModalState({
        isShowModal: true,
        mainText: '도로명 주소 혹은 상호명을 입력해주세요:)',
      });
      return;
    }
    searchHistory.save(value);
    if (keyword === nextKeyword) {
      void refetch();
    } else {
      setKeyword(nextKeyword);
    }
  };

  const onSearch = (value: string) => {
    setSearchText(value);
    searchPlaces(value);
  };

  return (
    <div className="p-20 min-h-screen">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          searchPlaces(searchText);
        }}
      >
        <div className="relative flex">
          <input
            type="text"
            aria-label="장소 검색어"
            className="h-40 w-full rounded-lg border border-stroke-brand-solid bg-bg-layer-floating pl-16 pr-48 text-15 text-fg-brand placeholder:text-fg-neutral-muted focus-visible:ring-2 focus-visible:ring-stroke-focus-ring"
            placeholder="도로명 주소 혹은 상호명 입력"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          {searchText.length > 0 && (
            <button
              type="button"
              aria-label="검색어 삭제"
              onClick={() => setSearchText('')}
              className="absolute right-44 top-1/2 transform -translate-y-1/2"
            >
              <CircleX
                aria-hidden
                className="h-16 w-16 text-fg-neutral-muted"
              />
            </button>
          )}
          <button
            type="submit"
            aria-label="장소 검색"
            className="px-8 w-40 absolute top-0 right-4 h-full"
          >
            <Image src={SearchIcon} alt="search" />
          </button>
        </div>
        {isOnSearch && (
          <div className="h-full z-10 py-20">
            <RecentSearch handleSearch={onSearch} keyValue={searchHistoryKey} />
          </div>
        )}
      </form>
      <ul
        className="my-20 overflow-auto h-dvh"
        style={data?.places.length ? { paddingBottom: '10rem' } : undefined}
      >
        {data?.places.map((place) => (
          <PlaceItem
            key={place.id}
            place={place}
            handleSaveData={handleSaveData}
          />
        ))}
      </ul>
    </div>
  );
}

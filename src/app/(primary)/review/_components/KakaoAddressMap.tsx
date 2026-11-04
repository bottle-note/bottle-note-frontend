import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { CircleX } from 'lucide-react';
import useModalStore from '@/store/modalStore';
import { KakaoPlace } from '@/types/Review';
import { SearchHistoryService } from '@/lib/SearchHistoryService';
import {
  loadKakaoMapsSDK,
  searchKakaoPlaces,
  toPlaceLocation,
} from '@/lib/kakao/kakaoPlaces';
import RecentSearch from '@/components/feature/Search/RecentSearch';
import SearchIcon from 'public/icon/search-subcoral.svg';

interface Props {
  handleSaveData: (place: KakaoPlace) => void;
}

export default function KakaoAddressMap({ handleSaveData }: Props) {
  const { handleModalState } = useModalStore();
  const searchHistoryKey = 'addressSearchHistory';
  const SearchHistory = new SearchHistoryService(searchHistoryKey);
  const formRef = useRef<HTMLFormElement | null>(null);
  const keywordRef = useRef<HTMLInputElement | null>(null);
  const [searchText, setSearchText] = useState('');
  const [isOnSearch, setIsOnSearch] = useState(true);

  useEffect(() => {
    const onLoadKakaoMap = () => {
      function getListItem(
        index: number,
        place: KakaoPlace,
        totalCount: number,
      ) {
        const { category } = toPlaceLocation(place);
        const el = document.createElement('li');
        let itemStr = `<div><div class="title_row"><div><span class="title">${place.place_name}</span>`;

        if (category) {
          itemStr += `<span class="category">${category}</span></div>`;
        }

        if (place.place_url) {
          itemStr += `<span class="url" onClick="window.open('${place.place_url}', '_blank')">지도</span></div>`;
        }

        if (place.road_address_name) {
          itemStr += `<div class="row">
                <div class="label">도로명</div>
                <div class="detail">${place.road_address_name}</div>
              </div>
              <div class="row">
                <div class="label">지번</div>
                <div class="detail">${place.address_name}</div>
              </div>
            `;
        } else {
          itemStr += `<div class="row">
                <div class="label">지번</div>
                <div class="detail">${place.address_name}</div>
              </div>`;
        }

        if (place.phone) {
          itemStr += `<div class="row">
                  <div class="label">전화</div>
                  <div class="detail">${place.phone}</div>
                </div>`;
        }

        el.innerHTML = itemStr;
        el.className = 'item';

        el.style.borderTop = '1px solid var(--color-stroke-neutral-subtle)';
        if (index === totalCount - 1) {
          el.style.borderBottom =
            '1px solid var(--color-stroke-neutral-subtle)';
        }

        el.style.padding = '10px 0';

        const titleRowElements = el.querySelector('.title_row') as HTMLElement;
        titleRowElements.style.display = 'flex';
        titleRowElements.style.alignItems = 'center';
        titleRowElements.style.justifyContent = 'space-between';

        const titleElements = el.querySelector('.title') as HTMLElement;
        titleElements.style.color = 'var(--color-fg-neutral)';
        titleElements.style.fontSize = '14px';
        titleElements.style.fontWeight = 'bold';
        titleElements.style.marginRight = '10px';

        const categoryElements = el.querySelector('.category') as HTMLElement;
        categoryElements.style.color = 'var(--color-fg-neutral-muted)';
        categoryElements.style.fontSize = '14px';

        const urlElements = el.querySelector('.url') as HTMLElement;
        urlElements.style.color = 'var(--color-fg-brand)';
        urlElements.style.fontSize = '12px';

        const rowElement = el.getElementsByClassName('row');
        Array.from(rowElement).forEach((element) => {
          const htmlElement = element as HTMLElement;
          htmlElement.style.display = 'flex';
          htmlElement.style.alignItems = 'center';
          htmlElement.style.marginTop = '5px';
        });

        const labelElement = el.getElementsByClassName('label');
        Array.from(labelElement).forEach((element) => {
          const htmlElement = element as HTMLElement;
          htmlElement.style.marginRight = '10px';
          htmlElement.style.border =
            '2px solid var(--color-stroke-neutral-subtle)';
          htmlElement.style.color = 'var(--color-fg-neutral-muted)';
          htmlElement.style.fontSize = '12px';
          htmlElement.style.width = '50px';
          htmlElement.style.display = 'flex';
          htmlElement.style.justifyContent = 'center';
          htmlElement.style.alignItems = 'center';
          htmlElement.style.height = '100%';
        });

        const detailElement = el.getElementsByClassName('detail');
        Array.from(detailElement).forEach((element) => {
          const htmlElement = element as HTMLElement;
          htmlElement.style.color = 'var(--color-fg-neutral)';
          htmlElement.style.fontSize = '12px';
        });

        el.addEventListener('click', () => handleSaveData(place));

        return el;
      }

      function removeAllChildNods(el: any) {
        while (el.hasChildNodes()) {
          el.removeChild(el.lastChild);
        }
      }

      function displayPlaces(places: KakaoPlace[]) {
        const listEl = document.getElementById('placesList');
        const fragment = document.createDocumentFragment();
        removeAllChildNods(listEl);

        for (let i = 0; i < places.length; i++) {
          const itemEl = getListItem(i, places[i], places.length);
          fragment.appendChild(itemEl);
        }
        listEl?.appendChild(fragment);
        if (listEl) {
          listEl.style.paddingBottom = '10rem';
        }
      }

      function searchPlaces() {
        const keyword = keywordRef.current?.value || '';
        if (!keyword.trim()) {
          handleModalState({
            isShowModal: true,
            mainText: '도로명 주소 혹은 상호명을 입력해주세요:)',
          });
          return false;
        }
        searchKakaoPlaces(keyword)
          .then(({ places }) => {
            if (places.length === 0) {
              alert('검색 결과가 존재하지 않습니다.');
              return;
            }
            displayPlaces(places);
            setIsOnSearch(false);
          })
          .catch(() =>
            handleModalState({
              isShowModal: true,
              mainText: '검색 결과 중 오류가 발생했습니다.',
            }),
          );
        SearchHistory.save(keyword);
      }

      const searchForm = document.getElementById('form');
      searchForm?.addEventListener('submit', function (e) {
        e.preventDefault();
        searchPlaces();
      });
    };
    loadKakaoMapsSDK()
      .then(onLoadKakaoMap)
      .catch(() =>
        handleModalState({
          isShowModal: true,
          mainText: '지도를 불러오지 못했습니다.',
        }),
      );
  }, []);

  const onSearch = (keyword: string) => {
    setSearchText(keyword);
    if (keywordRef.current) {
      keywordRef.current.value = keyword;
    }
    if (formRef.current) {
      const event = new Event('submit', { bubbles: false, cancelable: true });
      formRef.current.dispatchEvent(event);
    }
  };

  return (
    <div className="p-20 min-h-screen">
      <form id="form" ref={formRef} onSubmit={(e) => e.preventDefault()}>
        <div className="relative flex">
          <input
            type="text"
            id="keyword"
            ref={keywordRef}
            className="h-40 w-full rounded-lg border border-stroke-brand-solid bg-bg-layer-floating pl-16 pr-48 text-15 text-fg-brand placeholder:text-fg-neutral-muted focus-visible:ring-2 focus-visible:ring-stroke-focus-ring"
            placeholder="도로명 주소 혹은 상호명 입력"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
            }}
          />
          {searchText.length > 0 && (
            <button
              type="button"
              onMouseDown={() => {
                setSearchText('');
                if (keywordRef.current) {
                  keywordRef.current.value = '';
                }
              }}
              className="absolute right-44 top-1/2 transform -translate-y-1/2"
            >
              <CircleX
                aria-label="검색어 삭제"
                className="h-16 w-16 text-fg-neutral-muted"
              />
            </button>
          )}
          <button
            type="submit"
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
      <ul id="placesList" className="my-20 overflow-auto h-dvh" />
    </div>
  );
}

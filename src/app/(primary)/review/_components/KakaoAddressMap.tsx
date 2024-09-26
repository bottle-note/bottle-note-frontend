import { useEffect, useState } from 'react';
import Image from 'next/image';
import useModalStore from '@/store/modalStore';
import { KakaoPlace } from '@/types/Review';
import { SearchHistoryService } from '@/lib/SearchHistoryService';
import RecentSearch from '../../_components/RecentSearch';

interface Props {
  handleSaveData: (place: KakaoPlace, category?: string | null) => void;
}

export default function KakaoAddressMap({ handleSaveData }: Props) {
  const { handleModalState } = useModalStore();
  const searchHistoryKey = 'addressSearchHistory';
  const SearchHistory = new SearchHistoryService(searchHistoryKey);
  const [searchText, setSearchText] = useState('');
  const [isOnSearch, setIsOnSearch] = useState(true);

  useEffect(() => {
    const script = document.createElement('script');
    script.async = true;
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID}&autoload=false&libraries=services`;
    document.head.appendChild(script);

    const onLoadKakaoMap = () => {
      window.kakao.maps.load(() => {
        const ps = new window.kakao.maps.services.Places();

        function getListItem(
          index: number,
          place: KakaoPlace,
          totalCount: number,
        ) {
          let category = null;
          const el = document.createElement('li');
          let itemStr = `<div><div class="title_row"><div><span class="title">${place.place_name}</span>`;

          if (place.category_name) {
            const categoryArr = place.category_name.split(' > ');
            category = categoryArr[categoryArr.length - 1];
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

          el.style.borderTop = '1px solid #bfbfbf';
          if (index === totalCount - 1) {
            el.style.borderBottom = '1px solid #bfbfbf';
          }

          el.style.padding = '10px 0';

          const titleRowElements = el.querySelector(
            '.title_row',
          ) as HTMLElement;
          titleRowElements.style.display = 'flex';
          titleRowElements.style.alignItems = 'center';
          titleRowElements.style.justifyContent = 'space-between';

          const titleElements = el.querySelector('.title') as HTMLElement;
          titleElements.style.color = '#101010';
          titleElements.style.fontSize = '14px';
          titleElements.style.fontWeight = 'bold';
          titleElements.style.marginRight = '10px';

          const categoryElements = el.querySelector('.category') as HTMLElement;
          categoryElements.style.color = '#666666';
          categoryElements.style.fontSize = '14px';

          const urlElements = el.querySelector('.url') as HTMLElement;
          urlElements.style.color = '#E58257';
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
            htmlElement.style.border = '2px solid #e6e6dd';
            htmlElement.style.color = '#666666';
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
            htmlElement.style.color = '#101010';
            htmlElement.style.fontSize = '12px';
          });

          el.addEventListener('click', () => handleSaveData(place, category));

          return el;
        }

        function removeAllChildNods(el: any) {
          while (el.hasChildNodes()) {
            el.removeChild(el.lastChild);
          }
        }

        function displayPlaces(places: any) {
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

        function placesSearchCB(data: any, status: any) {
          if (status === window.kakao.maps.services.Status.OK) {
            displayPlaces(data);
            setIsOnSearch(false);
          } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
            alert('검색 결과가 존재하지 않습니다.');
          } else if (status === window.kakao.maps.services.Status.ERROR) {
            handleModalState({
              isShowModal: true,
              mainText: '검색 결과 중 오류가 발생했습니다.',
              type: 'ALERT',
            });
          }
        }

        function searchPlaces() {
          const keyword = (
            document.getElementById('keyword') as HTMLInputElement
          ).value;
          if (!keyword.replace(/^\s+|\s+$/g, '')) {
            handleModalState({
              isShowModal: true,
              mainText: '도로명 주소 혹은 상호명을 입력해주세요:)',
              type: 'ALERT',
            });
            return false;
          }
          ps.keywordSearch(keyword, placesSearchCB);
          SearchHistory.save(keyword);
        }

        const searchForm = document.getElementById('form');
        searchForm?.addEventListener('submit', function (e) {
          e.preventDefault();
          searchPlaces();
        });
      });
    };
    script.addEventListener('load', onLoadKakaoMap);
  }, []);

  const onSearch = (keyword: string) => {
    setSearchText(keyword);
  };

  return (
    <div className="p-5 min-h-screen">
      <div className="relative">
        <form id="form">
          <input
            type="text"
            id="keyword"
            className="w-full bg-white rounded-lg h-10 pl-4 pr-12 text-mainDarkGray border-subCoral border outline-none placeholder-mainCoral text-15"
            placeholder="도로명 주소 혹은 상호명 입력"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
            }}
          />
          <button
            className="px-2 w-10 absolute top-0 right-1 h-full"
            type="submit"
          >
            <Image
              src="/icon/search-subcoral.svg"
              alt="search button"
              width={30}
              height={10}
            />
          </button>
        </form>
      </div>
      {isOnSearch && (
        <div className="h-full z-10 py-5">
          <RecentSearch handleSearch={onSearch} keyValue={searchHistoryKey} />
        </div>
      )}
      <ul id="placesList" className="my-5 overflow-auto h-dvh" />
    </div>
  );
}

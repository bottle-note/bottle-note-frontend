import { useEffect, useState } from 'react';

declare const window: typeof globalThis & {
  kakao: any;
};

export default function MarketMapContainer2() {
  useEffect(() => {
    const script = document.createElement('script');
    script.async = true;
    script.src =
      '//dapi.kakao.com/v2/maps/sdk.js?appkey=95194ddc9f0a1d0d472b21defa0add01&autoload=false&libraries=services';

    document.head.appendChild(script);

    const onLoadKakaoMap = () => {
      window.kakao.maps.load(() => {
        const container = document.getElementById('map');
        const options = {
          center: new kakao.maps.LatLng(33.450701, 126.570667), //지도의 중심좌표.
          level: 3, //지도의 레벨(확대, 축소 정도)
        };

        new kakao.maps.Map(container, options);
        // const map = new kakao.maps.Map(container, options);

        // 장소 검색 객체를 생성합니다
        const ps = new window.kakao.maps.services.Places();

        const searchForm = document.getElementById('form');

        searchForm?.addEventListener('submit', function (e) {
          e.preventDefault();
          // 키워드로 장소를 검색합니다
          searchPlaces();
        });

        // 키워드 검색을 요청하는 함수입니다
        function searchPlaces() {
          const keyword = document.getElementById('keyword').value;

          if (!keyword.replace(/^\s+|\s+$/g, '')) {
            alert('키워드를 입력해주세요!');
            return false;
          }

          // 장소검색 객체를 통해 키워드로 장소검색을 요청합니다
          ps.keywordSearch(keyword, placesSearchCB);
        }

        // 장소검색이 완료됐을 때 호출되는 콜백함수 입니다
        function placesSearchCB(data: any, status: any) {
          if (status === window.kakao.maps.services.Status.OK) {
            // 정상적으로 검색이 완료됐으면
            // 검색 목록과 마커를 표출합니다
            displayPlaces(data);

            const bounds = new window.kakao.maps.LatLngBounds();
            for (let i = 0; i < data.length; i++) {
              bounds.extend(new window.kakao.maps.LatLng(data[i].y, data[i].x));
            }

            // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
            // map.setBounds(bounds);
          } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
            alert('검색 결과가 존재하지 않습니다.');
            return;
          } else if (status === window.kakao.maps.services.Status.ERROR) {
            alert('검색 결과 중 오류가 발생했습니다.');
            return;
          }
        }

        // 검색 결과 목록과 마커를 표출하는 함수입니다
        function displayPlaces(places: any) {
          const listEl = document.getElementById('placesList');
          const menuEl = document.getElementById('menu_wrap');
          const fragment = document.createDocumentFragment();
          const bounds = new window.kakao.maps.LatLngBounds();
          const listStr = '';
          // 검색 결과 목록에 추가된 항목들을 제거합니다
          removeAllChildNods(listEl);

          for (let i = 0; i < places.length; i++) {
            //   // 마커를 생성하고 지도에 표시합니다
            //   const placePosition = new window.kakao.maps.LatLng(
            //     places[i].y,
            //     places[i].x,
            //   );
            const itemEl = getListItem(i, places[i]); // 검색 결과 항목 Element를 생성합니다
            //   // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
            //   // LatLngBounds 객체에 좌표를 추가합니다
            //   bounds.extend(placePosition);

            fragment.appendChild(itemEl);
          }

          // 검색결과 항목들을 검색결과 목록 Element에 추가합니다
          listEl?.appendChild(fragment);
        }

        // 검색결과 항목을 Element로 반환하는 함수입니다
        function getListItem(index: number, places: any) {
          console.log('places', places);
          const el = document.createElement('li');

          let itemStr =
            '<span class="markerbg marker_' +
            (index + 1) +
            '"></span>' +
            '<div class="info">' +
            '   <h5>' +
            places.place_name +
            '</h5>';

          if (places.road_address_name) {
            itemStr +=
              '    <span>' +
              places.road_address_name +
              '</span>' +
              '   <span class="jibun gray">' +
              places.address_name +
              '</span>';
          } else {
            itemStr += '    <span>' + places.address_name + '</span>';
          }

          itemStr += '  <div class="tel">' + places.phone + '</div>';
          itemStr += '  <div class="tel">' + places.category_name + '</div>';
          itemStr +=
            '  <div class="tel">' + places.place_url + '</div>' + '</div>';

          el.innerHTML = itemStr;
          el.className = 'item';

          return el;
        }

        // 검색결과 목록의 자식 Element를 제거하는 함수입니다
        function removeAllChildNods(el: any) {
          while (el.hasChildNodes()) {
            el.removeChild(el.lastChild);
          }
        }
      });
    };
    script.addEventListener('load', onLoadKakaoMap);
  }, []);

  const [aaa, setAaa] = useState('');

  const onchangeTest = (event: any) => {
    setAaa(event?.target.value);
  };

  return (
    <div className="map_wrap">
      <div
        id="map"
        style={{
          width: '500px',
          height: '400px',
          display: 'none',
        }}
      ></div>

      <div id="menu_wrap" className="bg_white">
        <div className="option">
          <div>
            <form id="form">
              키워드 :{' '}
              <input
                type="text"
                value={aaa}
                id="keyword"
                onChange={onchangeTest}
              />
              <button type="submit">검색하기</button>
            </form>
          </div>
        </div>
        <ul id="placesList" style={{ overflow: 'auto', height: '600px' }}></ul>
      </div>
    </div>
  );
}

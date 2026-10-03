/* Local design prototype. All records are illustrative; no product API or auth calls. */
const { bottles, categories, reviews, articles, pages } = window.BN;
const $ = (q, root = document) => root.querySelector(q);
const esc = (v = '') =>
  String(v).replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ],
  );
let params,
  page,
  bottle,
  mode,
  bannerIndex = 0,
  bannerPaused = false,
  bannerTimer;
let theme =
  new URLSearchParams(location.search).get('theme') ||
  localStorage.getItem('bn-editorial-theme') ||
  'light';
const local = {
  picks: new Set([1, 4]),
  ratings: { 0: 4.5, 1: 4 },
  comments: [],
  likes: new Set(),
  recent: [0, 1],
  following: false,
  draft: {},
  uploaded: [],
  ownReview: null,
  name: '오크향기',
};
try {
  const saved = JSON.parse(
    sessionStorage.getItem('bn-editorial-records') || 'null',
  );
  if (saved)
    Object.assign(local, saved, {
      picks: new Set(saved.picks),
      likes: new Set(saved.likes),
    });
} catch {}
if (local.name !== '오크향기')
  reviews.forEach((r) => {
    if (r.author === '오크향기') r.author = local.name;
  });
function persist() {
  try {
    sessionStorage.setItem(
      'bn-editorial-records',
      JSON.stringify({
        ...local,
        picks: [...local.picks],
        likes: [...local.likes],
      }),
    );
  } catch {}
}
window.addEventListener('pagehide', persist);
const slot = (kind, props = {}, cls = '') =>
  `<div class="real-ui ${cls}" data-real-ui="${kind}" data-props="${esc(JSON.stringify(props))}"></div>`;
const routeFiles = {
  home: 'index',
  explore: 'explore',
  whiskey: 'whiskey',
  review: 'review',
  write: 'write-review',
  profile: 'profile',
  bottle: 'my-bottle',
  history: 'history',
  curation: 'curation',
  article: 'article',
  imports: 'imports',
  import: 'import-detail',
  reviews: 'whiskey-reviews',
  importer: 'importer',
  settings: 'settings',
  login: 'login',
  search: 'search-input',
  'edit-profile': 'edit-profile',
};
const asset = (name) => 'assets/' + name;
const icon = (name, cls = '') =>
  name === 'history/like_unfilled_subcoral'
    ? `<img class="icon source-icon ${cls}" src="${asset('icon/' + name + '.svg')}" alt="">`
    : `<span aria-hidden="true" class="icon ${cls}" style="--icon:url('${window.BN_ICONS[name] || asset('icon/' + name + '.svg')}')"></span>`;
const image = (b, cls = '') =>
  `<span class="photo ${cls}"><img src="${asset(b.image)}" alt="${esc(b.name)}" loading="lazy"></span>`;
const link = (to, extra = {}) =>
  routeFiles[to] +
  '.html' +
  (Object.keys(extra).length || mode === 'guest'
    ? '?' +
      new URLSearchParams({
        ...(mode === 'guest' ? { state: mode } : {}),
        ...extra,
      })
    : '');
const go = (to, extra = {}) => {
  persist();
  location.assign(link(to, extra));
};
const score = (value) => slot('score', { value }, 'inline-score');
const tags = (items) => slot('tags', { items });
const arrow = () => icon('arrow-right-subcoral');
const button = (text, to, extra = {}, secondary = false) =>
  `<a class="button ${secondary ? 'secondary' : ''}" href="${link(to, extra)}">${text}</a>`;
const empty = (title, copy, action = '위스키 둘러보기', to = 'explore') =>
  `<div class="empty"><img src="${asset('bottle_note_logo.svg')}" alt=""><h2>${title}</h2><p>${copy}</p>${button(action, to, { tab: '위스키' })}</div>`;
const heading = (title, copy = '', action = '') =>
  `<div class="section-heading"><div><h2>${title}</h2>${copy ? `<p>${copy}</p>` : ''}</div>${action}</div>`;
const rows = (values) =>
  `<dl class="info-rows">${values
    .filter((v) => v[1] !== null && v[1] !== undefined && v[1] !== '')
    .map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${v}</dd></div>`)
    .join('')}</dl>`;
function tabs(items, value, key = 'tab') {
  return slot('tabs', { items, value, group: key }, 'source-tabs');
}
function notice(text) {
  const el = $('.toast');
  el.textContent = text;
  el.hidden = false;
  clearTimeout(notice.timer);
  notice.timer = setTimeout(() => (el.hidden = true), 2800);
}
function modal(title, body) {
  RealUI.clear($('#dialog-content'));
  $('#dialog-content').innerHTML = `<h2>${title}</h2>${body}`;
  RealUI.upgradeButtons($('#dialog-content'));
  $('#dialog').showModal();
}
function gate() {
  if (mode !== 'guest') return false;
  modal(
    '로그인이 필요해요',
    `<p>로그인하고 별점과 리뷰를 남겨보세요.</p>${button('로그인하기', 'login')}`,
  );
  return true;
}
function setTheme(value) {
  theme = value;
  document.documentElement.classList.toggle('dark', theme === 'dark');
  localStorage.setItem('bn-editorial-theme', value);
}
function shell(content) {
  const title =
    collectionTitle() || pages.find((p) => p[0] === page)?.[1] || '보틀노트';
  const navs = [
    ['home', '홈', 'House', {}],
    ['explore', '둘러보기', 'Compass', { tab: '위스키' }],
    ['explore', '리뷰', 'NotebookPen', { tab: '리뷰' }],
    ['curation', '시음회·정보', 'Wine', {}],
    ['profile', '마이보틀', 'Bookmark', {}],
  ];
  const selected = (id, q) =>
    id === 'explore'
      ? page === 'explore' && (params.get('tab') || '위스키') === q.tab
      : id === 'profile'
        ? ['profile', 'bottle', 'history', 'edit-profile'].includes(page)
        : id === 'curation'
          ? ['curation', 'article'].includes(page)
          : page === id;
  const navigation = navs
    .map(
      ([id, label, i, q]) =>
        `<a href="${link(id, q)}" ${selected(id, q) ? 'aria-current="page"' : ''}>${icon(i)}<span>${label}</span></a>`,
    )
    .join('');
  return `<a class="skip-link" href="#main">본문으로 이동</a><aside class="editorial-rail"><a class="rail-brand" href="${link('home')}" aria-label="Bottle Note 홈"><img class="rail-wordmark" src="${asset('bottle_note_Icon_logo.svg')}" alt=""><img class="rail-symbol" src="${asset('bottle_note_logo.svg')}" alt=""></a><nav aria-label="주요 메뉴">${navigation}</nav><div class="rail-secondary"><a href="${link('imports')}" ${['imports', 'import', 'importer'].includes(page) ? 'aria-current="page"' : ''}>${icon('Package')}<span>수입통관</span></a><a href="${link('history')}">${icon('History')}<span>나의 히스토리</span></a><a href="${link('settings')}">${icon('Settings2')}<span>설정</span></a></div><p class="rail-note">한 잔의 순간을,<br>오래 남는 기록으로.</p></aside><div class="workspace ${['explore', 'curation', 'profile', 'bottle', 'imports', 'import', 'importer'].includes(page) ? 'collection-workspace ' + (['import', 'importer'].includes(page) ? 'collection-detail-workspace' : '') : ''}"><header class="editorial-header"><div class="header-title">${page === 'home' ? `<a class="mobile-brand" href="${link('home')}"><img src="${asset('bottle_note_Icon_logo.svg')}" alt="Bottle Note"></a><span class="desktop-title">홈</span>` : `<button class="icon-button back" data-back aria-label="뒤로">${icon('ArrowLeft')}</button><span>${page === 'write' ? '리뷰 작성' : title}</span>`}</div><a class="header-search" href="${link('search')}">${icon('Search')}<span>어떤 위스키를 찾으세요?</span></a><div class="header-actions"><button class="icon-button" data-theme aria-label="화면 모드 변경" title="화면 모드 변경">${icon(theme === 'dark' ? 'Sun' : 'Moon')}</button><a class="icon-button" href="${link('profile')}" aria-label="내 프로필">${icon('UserRound')}</a></div></header><main id="main" class="page page-${page}">${content}</main><footer class="product-footer"><img src="${asset('bottle_note_Icon_logo.svg')}" alt="Bottle Note"><span>한 잔의 순간을 기록하다.</span><a href="${link('settings')}">설정</a></footer></div><nav class="editorial-bottom" aria-label="하단 메뉴">${navigation}</nav>`;
}
function bottleRow(b, extra = '', rank = null) {
  return `<article class="bottle-entry">${rank !== null ? `<span class="entry-rank">${String(rank).padStart(2, '0')}</span>` : ''}<a class="entry-main" href="${link('whiskey', { b: b.id })}">${image(b)}<div class="entry-copy"><p class="meta">${esc(b.category)}${rank === null ? ' · ' + esc(b.country) : ''}</p><h3>${esc(b.name)}</h3><p class="english">${esc(b.en)}</p><div class="entry-rating">${score(b.rating)}<span>${extra || '평균 별점'}</span></div></div></a><button class="icon-button entry-save" data-pick="${b.id}" data-compact aria-label="${esc(b.name)} 찜" aria-pressed="${local.picks.has(b.id)}">${icon('Bookmark')}</button></article>`;
}
function reviewItem(r) {
  const b = bottles[r.bottle];
  return `<article class="review-row"><div class="person-row"><a href="${link('profile', { user: r.author === local.name ? 'me' : 'other' })}"><img class="avatar" src="${asset('profile-default.svg')}" alt=""><b>${esc(r.author)}</b></a>${score(r.rating)}</div><a class="review-link" href="${link('review', { r: r.id })}"><h3>${esc(b.name)}</h3><p>${esc(r.text.split('\n\n')[0])}</p>${tags(r.tags)}</a><div class="review-meta"><span>${icon('history/like_unfilled_subcoral')}${r.likes}</span><span>${icon('comment-outlined-subcoral')}1</span><time>${r.date}</time></div></article>`;
}
function banner() {
  return `<section class="editorial-banner ${bannerIndex ? 'magazine-banner' : 'autumn-banner'}" aria-label="보틀노트 소식" aria-roledescription="캐러셀"><a class="banner-slide" href="${link('article', { a: bannerIndex })}"><img src="${asset(bannerIndex ? 'banner-magazine.png' : 'banner-autumn.webp')}" alt="${bannerIndex ? '위스키와 함께하는 보틀노트 매거진' : '가을 잎과 로크리 위스키'}" fetchpriority="high"><div class="editorial-banner-copy"><span>${bannerIndex ? 'BOTTLE NOTE MAGAZINE' : 'OCTOBER NOTE'}</span><h1>${bannerIndex ? '한 잔 너머의<br>이야기' : '가을을 닮은<br>위스키'}</h1><p>${bannerIndex ? '보틀노트가 전하는 위스키 이야기' : '따스함에서 서늘함으로 건너가는 시간'}</p><span class="banner-read">${bannerIndex ? '매거진 읽기' : '가을 노트 펼치기'} ${icon('ArrowUpRight')}</span></div></a><div class="editorial-banner-controls"><span><b>${String(bannerIndex + 1).padStart(2, '0')}</b> / 02</span><button data-banner="prev" aria-label="이전 배너">${icon('ChevronLeft')}</button><button data-banner="next" aria-label="다음 배너">${icon('ChevronRight')}</button><button data-banner="pause" aria-label="${bannerPaused ? '배너 자동 재생' : '배너 자동 재생 정지'}">${icon(bannerPaused ? 'Play' : 'Pause')}</button></div></section>`;
}
function home() {
  const tab = params.get('tab') || '주간 TOP 5';
  const list =
    tab === '최근 본 위스키' ? local.recent.map((id) => bottles[id]) : bottles;
  const tools = [
    [
      '취향 테스트',
      'SlidersHorizontal',
      'https://bottle-note.com/whiskey-mbti',
      true,
    ],
    [
      '위스키 타로',
      'GalleryVerticalEnd',
      'https://bottle-note.com/whiskey-tarot',
      true,
    ],
    [
      '최근 본 위스키',
      'History',
      link('home', { tab: '최근 본 위스키' }),
      false,
    ],
    ['나의 기록', 'NotebookPen', link('history'), false],
  ];
  return `${banner()}<nav class="quick-tools" aria-label="바로 가기">${tools.map(([name, i, url, external]) => `<a href="${url}" ${external ? 'target="_blank" rel="noopener"' : ''}>${icon(i)}<span>${name}</span>${external ? icon('ArrowUpRight', 'quick-external') : ''}</a>`).join('')}</nav><section class="home-section notebook-section">${tabs(['주간 TOP 5', '최근 본 위스키', '시음회'], tab)}${heading(tab === '주간 TOP 5' ? '이번 주, 많이 펼쳐본 위스키' : tab === '최근 본 위스키' ? '다시 보고 싶은 한 병' : '함께 마시는 시간', tab === '주간 TOP 5' ? '보틀노트에서 가장 많이 찾아본 위스키예요.' : '', `<a class="text-link" href="${link(tab === '시음회' ? 'curation' : 'explore', { tab: tab === '시음회' ? '시음회' : '위스키' })}">전체 보기 ${icon('ArrowUpRight')}</a>`)}${
    tab === '시음회'
      ? `<div class="cover-grid">${articles
          .filter((a) => a.date)
          .map(articleCard)
          .join('')}</div>`
      : `<div class="rank-grid">${list.map((b, i) => bottleRow(b, '', tab === '주간 TOP 5' ? i + 1 : null)).join('')}</div>`
  }</section><section class="home-section category-section">${heading('어떤 위스키를 좋아하세요?', '취향에 맞는 한 병을 찾아보세요.')}<div class="category-index">${categories.map(([name, en, file], i) => `<a href="${link('explore', { tab: '위스키', category: name })}"><span class="category-number">0${i + 1}</span><div><h3>${name}</h3><p>${en}</p></div><img src="${asset('categoryImg/' + file)}" alt="">${icon('ArrowUpRight')}</a>`).join('')}</div></section><section class="home-section home-notes">${heading('한 잔에 담긴 이야기', '', `<a class="text-link" href="${link('explore', { tab: '리뷰' })}">리뷰 더 보기 ${icon('ArrowUpRight')}</a>`)}<div class="list-grid review-grid">${reviews.slice(0, 2).map(reviewItem).join('')}</div></section>`;
}
function searchBar(placeholder = '위스키 이름을 검색하세요') {
  return `<div class="search-tools">${slot('search', { placeholder, value: params.get('q') || '' })}<button class="icon-button filter-button" data-filter aria-label="필터" aria-expanded="false" aria-controls="filters">${icon('filter-subcoral')}</button></div><div id="filters" class="filters" hidden><label>정렬<select id="sort"><option value="recent">최신순</option><option value="rating">평점 높은 순</option></select></label><label>카테고리<select id="category"><option value="">전체</option>${categories.map(([c]) => `<option ${params.get('category') === c ? 'selected' : ''}>${c}</option>`).join('')}</select></label></div>`;
}
function explore() {
  return collectionExplore();
}
function results() {
  const target = $('#results');
  if (!target) return;
  if (page === 'imports') {
    clearanceResults(target);
    return;
  }
  if (page === 'importer') {
    companyResults(target);
    return;
  }
  if (['explore', 'curation', 'profile', 'bottle'].includes(page)) {
    compactResults(target);
    return;
  }
  const q = (params.get('q') || '').toLowerCase().trim(),
    sort = $('#sort')?.value,
    cat = $('#category')?.value,
    tab = params.get('tab');
  let result = '';
  if (page === 'curation') {
    const type = tab || '시음회';
    result = `<div class="cover-grid">${articles
      .filter((a) => a.type === type && a.title.includes(q))
      .map(articleCard)
      .join('')}</div>`;
  } else if (page === 'imports' && tab === '수입사')
    result =
      '<div class="list-grid">' +
      ['보틀트레이딩', '몰트컴퍼니']
        .filter((n) => n.includes(q))
        .map(
          (n, i) =>
            `<a class="import-row" href="${link('importer', { company: n === '몰트컴퍼니' ? 1 : 0 })}"><p class="meta">주류 수입사</p><h3>${n}</h3><p>서울 · 영업 중</p>${arrow()}</a>`,
        )
        .join('') +
      '</div>';
  else if (page === 'imports')
    result = `<div class="list-grid">${bottles
      .filter((b) => (b.name + b.en).toLowerCase().includes(q))
      .map((b, i) =>
        tab === '수입사'
          ? `<a class="import-row" href="${link('importer')}"><p class="meta">주류 수입사</p><h3>${['보틀트레이딩', '몰트컴퍼니'][i % 2]}</h3><p>서울 · 영업 중</p>${arrow()}</a>`
          : importRow(b, i),
      )
      .join('')}</div>`;
  else if (page === 'history')
    result =
      mode === 'empty'
        ? empty('아직 남긴 기록이 없어요', '마신 위스키의 별점부터 남겨보세요.')
        : `<div class="timeline">${[
            ...(local.ownReview ? [local.ownReview] : []),
            ...reviews,
          ]
            .filter(
              (r) =>
                r.author === local.name &&
                (bottles[r.bottle].name + r.text).toLowerCase().includes(q),
            )
            .map(
              (r, i) =>
                `<section><time>${r.date}</time><div><p class="timeline-label">${i % 2 ? '별점을 남겼어요' : '리뷰를 기록했어요'}</p>${bottleRow(bottles[r.bottle], `내 별점 ${r.rating.toFixed(1)}`)}<a class="text-link" href="${link('review', { r: r.id })}">기록 보기 ${arrow()}</a></div></section>`,
            )
            .join('')}</div>`;
  else if (
    page === 'reviews' ||
    (page === 'explore' && (!tab || tab === '리뷰')) ||
    (page === 'bottle' && tab === '리뷰')
  ) {
    let list = [...(local.ownReview ? [local.ownReview] : []), ...reviews];
    if (page === 'explore') list = list.filter((r) => !r.private);
    if (page === 'reviews')
      list = list.filter(
        (r) =>
          r.bottle === bottle.id && (!r.private || r.author === local.name),
      );
    if (page === 'bottle' || (page === 'reviews' && tab === '내 리뷰'))
      list = list.filter((r) => r.author === local.name);
    list = list.filter((r) =>
      (r.text + bottles[r.bottle].name).toLowerCase().includes(q),
    );
    if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);
    if (mode === 'empty') list = [];
    result = `<div class="list-grid review-grid">${list.map(reviewItem).join('')}</div>`;
  } else {
    let list = [...bottles].filter(
      (b) =>
        (b.name + b.en).toLowerCase().includes(q) &&
        (!cat || cat === b.category) &&
        (!params.get('country') || params.get('country') === b.country),
    );
    if (page === 'bottle')
      list = list.filter((b) =>
        tab === '찜'
          ? local.picks.has(b.id)
          : local.ratings[b.id] !== undefined,
      );
    if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);
    if (mode === 'empty' && page === 'bottle') list = [];
    result = `<div class="list-grid">${list.map((b) => bottleRow(b, page === 'bottle' && tab !== '찜' ? `내 별점 ${local.ratings[b.id]?.toFixed(1)}` : '')).join('')}</div>`;
  }
  if (mode === 'empty' && ['curation', 'imports'].includes(page)) result = '';
  if (!result || !result.match(/<(article|a |section|h2)|data-real-ui/))
    result = empty(
      q
        ? '검색 결과가 없어요'
        : page === 'bottle'
          ? '아직 남긴 기록이 없어요'
          : '아직 표시할 내용이 없어요',
      q
        ? '검색어나 필터를 바꿔서 다시 찾아보세요.'
        : '위스키를 둘러보고 첫 기록을 남겨보세요.',
    );
  RealUI.clear(target);
  target.innerHTML = result;
  RealUI.upgradeButtons(target);
}
function ratingControl(value = '') {
  return `<div class="rating-control">${slot('rating', { value })}<input type="hidden" name="rating" id="rating-select" value="${value}"></div>`;
}
function whiskey() {
  const b = bottle;
  return `<div class="detail-breadcrumb"><a href="${link('explore', { tab: '위스키' })}">위스키</a>${icon('ChevronRight')}<a href="${link('explore', { tab: '위스키', category: b.category })}">${b.category}</a></div><div class="whiskey-lead"><div class="product-image-stage">${image(b, 'detail-photo')}<span>${esc(b.distillery || b.country)}</span></div><section class="whiskey-summary"><p class="eyebrow">${b.country} · ${b.category}</p><h1>${esc(b.name)}</h1><p class="english">${b.en}</p><div class="rating-summary"><div><span class="meta">평균 별점</span><div class="average-rating">${icon('Star')}<b>${b.rating.toFixed(1)}</b><small>/ 5</small></div></div><p>${b.age || b.category}<br>${b.abv ? b.abv + ' · ' : ''}${b.region}</p></div><div class="personal-rating"><div><h2>나의 별점</h2><p>마셔보셨나요? 별점으로 남겨보세요.</p></div>${ratingControl(local.ratings[b.id])}</div><nav class="detail-action-bar" aria-label="위스키에 대한 활동"><button data-pick="${b.id}" aria-pressed="${local.picks.has(b.id)}">${icon('Bookmark')}<span>${local.picks.has(b.id) ? '찜했어요' : '찜하기'}</span></button><a href="${link('write', { b: b.id })}">${icon('NotebookPen')}<span>리뷰 쓰기</span></a><button data-share>${icon('Share2')}<span>공유</span></button><a href="${link('import', { b: b.id })}">${icon('Package')}<span>수입 정보</span></a></nav></section></div><div class="detail-notebook"><nav class="detail-anchor-tabs" aria-label="상세 섹션"><a href="#whiskey-information" aria-current="true">위스키 노트</a><a href="#whiskey-reviews">리뷰</a></nav><div class="whiskey-information" id="whiskey-information"><section>${heading('이 위스키에 대하여')}<p class="body-copy">${esc(b.intro)}</p><h3 class="flavor-heading">풍미 태그</h3>${b.tags.length ? tags(b.tags) : '<p class="muted">아직 등록된 태그가 없어요.</p>'}</section><section>${
    mode === 'guest'
      ? `<div class="login-gate"><h2>더 자세히 알아보세요</h2><p>로그인하고 상세 정보를 확인하세요.</p>${button('로그인하기', 'login')}</div>`
      : rows([
          ['카테고리', b.category],
          ['증류소', b.distillery],
          ['국가 / 지역', b.country + ' / ' + b.region],
          ['숙성 연수', b.age],
          ['도수', b.abv],
        ])
  }</section></div><section class="detail-section" id="whiskey-reviews">${heading('이 위스키를 마신 사람들', '', `<a class="text-link" href="${link('reviews', { b: b.id })}">전체 리뷰 ${icon('ArrowUpRight')}</a>`)}${
    mode === 'empty'
      ? empty(
          '첫 리뷰를 남겨보세요',
          '이 위스키를 마셨던 순간은 어땠나요?',
          '리뷰 작성',
          'write',
        )
      : `<div class="list-grid review-grid">${
          [...(local.ownReview ? [local.ownReview] : []), ...reviews]
            .filter(
              (r) =>
                r.bottle === b.id && (!r.private || r.author === local.name),
            )
            .map(reviewItem)
            .join('') || '<p class="muted">아직 작성된 리뷰가 없어요.</p>'
        }</div>`
  }</section></div>`;
}

function reviewPage() {
  const r =
      params.get('r') === 'own' && local.ownReview
        ? local.ownReview
        : reviews[Number(params.get('r'))] || reviews[0],
    b = bottles[r.bottle];
  return `<div class="review-layout"><aside><h2 class="small-heading">이 리뷰의 위스키</h2>${bottleRow(b)}${r.author === local.name ? `<a class="text-link" href="${link('write', { b: b.id, edit: '1' })}">리뷰 수정 ${arrow()}</a>` : ''}</aside><article class="review-article"><div class="person-row"><a href="${link('profile', { user: r.author === local.name ? 'me' : 'other' })}"><img class="avatar" src="${asset('profile-default.svg')}" alt=""><b>${esc(r.author)}</b></a>${score(r.rating)}</div><p class="meta">${r.date} · ${r.private ? '비공개' : '공개'} 리뷰</p><div class="review-body">${esc(r.text).replaceAll('\n', '<br>')}</div>${r.photos?.length ? `<div class="review-photos">${r.photos.map((src) => `<img src="${src}" alt="리뷰 사진">`).join('')}</div>` : ''}${tags(r.tags)}${rows(
    [
      ['마신 방법', r.unit === 'BOTTLE' ? '병' : '잔'],
      ['가격', r.price ? Number(r.price).toLocaleString() + '원' : null],
      ['장소', esc(r.place || '')],
    ],
  )}<div class="review-actions"><button class="button secondary" data-like="${r.id}" aria-pressed="${local.likes.has(r.id)}">${icon('history/like_unfilled_subcoral')}좋아요 ${r.likes + (local.likes.has(r.id) ? 1 : 0)}</button><a class="text-link" href="#comments" data-comments>댓글 ${1 + local.comments.filter((c) => c.review === r.id).length}</a></div></article></div><section class="comments-section" id="comments">${heading('댓글')}<div class="comment"><b>오늘의한잔</b><p>왁시한 향이 궁금하네요. 다음에 마셔봐야겠어요.</p><time>2026.09.29</time></div>${local.comments
    .filter((c) => c.review === r.id)
    .map(
      (c) =>
        `<div class="comment"><b>${esc(local.name)}</b><p>${esc(c.text)}</p><time>방금</time></div>`,
    )
    .join(
      '',
    )}<form id="comment-form" data-review="${r.id}" class="comment-form"><label class="sr-only" for="comment-input">댓글</label><input id="comment-input" name="comment" placeholder="댓글을 남겨보세요" maxlength="500" required><button class="button">등록</button></form></section>`;
}
function writePage() {
  if (mode === 'guest')
    return empty(
      '로그인하고 기록을 남겨보세요',
      '내 별점과 리뷰를 마이보틀에 모아볼 수 있어요.',
      '로그인하기',
      'login',
    );
  const d = local.draft;
  if (params.get('edit') && !d.initialized) {
    Object.assign(d, {
      initialized: true,
      b: 0,
      rating: 4.5,
      content: reviews[0].text,
      price: 18000,
      place: '서울',
      unit: 'GLASS',
      visibility: 'public',
      tags: ['말린 꽃', '꿀', '오크'],
    });
  }
  return `<div class="write-layout"><aside class="write-aside"><h2 class="small-heading">기록할 위스키</h2>${bottleRow(bottles[d.b ?? bottle.id])}<p class="muted">마신 순간의 느낌을 편하게 남겨보세요.</p></aside><form id="review-form" class="review-form"><label class="field">위스키<select name="b">${bottles.map((b) => `<option value="${b.id}" ${Number(d.b ?? bottle.id) === b.id ? 'selected' : ''}>${esc(b.name)}</option>`).join('')}</select></label><fieldset><legend>별점</legend>${ratingControl(d.rating)}</fieldset><label class="field">리뷰<textarea name="content" placeholder="어떤 향과 맛이 느껴졌나요?" rows="7" required maxlength="3000">${esc(d.content || '')}</textarea><span class="field-help"><span id="char-count">${(d.content || '').length}</span> / 3,000</span></label><fieldset><legend>풍미 태그 <span class="optional">선택</span></legend><div class="tag-options">${['과일', '말린 꽃', '꿀', '바닐라', '오크', '스모키', '솔티', '왁시한'].map((t) => `<label><input type="checkbox" name="tag" value="${t}" ${(d.tags || []).includes(t) ? 'checked' : ''}><span>${t}</span></label>`).join('')}</div></fieldset><label class="field">장소 <span class="optional">선택</span><input name="place" placeholder="마신 장소를 입력하세요" value="${esc(d.place || '')}"></label><fieldset><legend>가격 <span class="optional">선택</span></legend><div class="price-fields"><select name="unit" aria-label="가격 단위"><option value="GLASS" ${d.unit === 'GLASS' ? 'selected' : ''}>잔</option><option value="BOTTLE" ${d.unit === 'BOTTLE' ? 'selected' : ''}>병</option></select><input type="number" name="price" min="0" step="1" inputmode="numeric" placeholder="금액" aria-label="가격" value="${esc(d.price || '')}"><span>원</span></div></fieldset><fieldset><legend>사진 <span class="optional">선택</span></legend><label class="photo-upload">${icon('photo-subcoral')}<span>사진 추가</span><input type="file" id="photo-input" accept="image/*" multiple></label><div id="photo-previews" class="photo-previews">${photoPreviews()}</div></fieldset><label class="field">공개 범위<select name="visibility"><option value="public">공개</option><option value="private" ${d.visibility === 'private' ? 'selected' : ''}>비공개 · 나만 보기</option></select></label><div class="form-footer"><a class="button secondary" href="${link('whiskey', { b: bottle.id })}">취소</a><button class="button">${params.get('edit') ? '수정 완료' : '리뷰 등록'}</button></div></form></div>`;
}
function photoPreviews() {
  return local.uploaded
    .map(
      (url, i) =>
        `<div><img src="${url}" alt="선택한 사진 ${i + 1}"><button type="button" class="icon-button" data-remove-photo="${i}" aria-label="사진 ${i + 1} 삭제">${icon('close-subcoral')}</button></div>`,
    )
    .join('');
}
function legacyProfile() {
  const other = params.get('user') === 'other';
  return `${heading(other ? '프로필' : '마이보틀')}<div class="profile-layout"><section class="profile-panel"><img class="profile-avatar" src="${asset('profile-default.svg')}" alt=""><h1>${other ? '오늘의한잔' : esc(local.name)}</h1><div class="follow-line"><button data-follow-list="팔로워">팔로워 <b>12</b></button><button data-follow-list="팔로잉">팔로잉 <b>8</b></button></div>${other ? `<button class="button secondary" data-follow aria-pressed="${local.following}">${local.following ? '팔로잉' : '팔로우'}</button>` : button('프로필 수정', 'edit-profile', {}, true)}<div class="profile-counts">${[
    ['별점', mode === 'empty' ? 0 : Object.keys(local.ratings).length],
    ['리뷰', mode === 'empty' ? 0 : 1 + (local.ownReview ? 1 : 0)],
    ['찜', mode === 'empty' ? 0 : local.picks.size],
  ]
    .map(
      ([name, n]) =>
        `<a href="${link('bottle', { tab: name })}"><b>${n}</b><span>${name}</span></a>`,
    )
    .join(
      '',
    )}</div></section><section class="profile-records">${heading('최근 기록', '', `<a class="text-link" href="${link('history')}">모든 기록 ${arrow()}</a>`)}${mode === 'empty' ? empty('아직 남긴 기록이 없어요', '별점 하나로 취향 기록을 시작해보세요.') : reviewItem(other ? reviews[1] : local.ownReview || reviews[0])}<a class="more-row" href="${link('bottle', { tab: '찜' })}"><span>찜한 위스키</span>${arrow()}</a></section></div>`;
}
function articleCard(a) {
  return `<a class="cover-card" href="${link('article', { a: a.id })}"><img src="${asset(a.image)}" alt="${a.title}"><div><p class="meta">${a.type}</p><h3>${a.title}</h3><p>${a.subtitle}</p>${a.date ? `<p class="meta">${a.date}</p>` : ''}</div></a>`;
}
function articlePage() {
  const a = articles[Number(params.get('a'))] || articles[0];
  return `<div class="article-lead"><img class="article-cover" src="${asset(a.image)}" alt="${a.title}"><div><p class="eyebrow">${a.type}</p><h1>${a.title}</h1><p class="article-subtitle">${a.subtitle}</p>${
    a.date
      ? rows([
          ['일시', a.date],
          ['장소', a.place],
          ['참가비', a.fee],
        ])
      : '<p class="meta">Bottle Note · 2026.09</p>'
  }${a.date ? '<button class="button" data-apply>신청 안내 보기</button>' : ''}</div></div><article class="article-body"><p>${a.body}</p><h2>${a.date ? '시음 라인업' : '함께 살펴볼 위스키'}</h2><div class="list-grid">${a.bottles.map((id) => bottleRow(bottles[id])).join('')}</div>${a.date ? '<h2>참여 안내</h2><p>행사별 신청 페이지에서 잔여석과 취소·환불 조건을 확인해 주세요.</p>' : `<a class="text-link" href="https://www.instagram.com/bottle_note_official/" target="_blank" rel="noopener">보틀노트 인스타그램 ${icon('externallink-outlined-gray')}</a>`}</article>`;
}
function importRow(b, i = 0) {
  return `<a class="import-row" href="${link('import', { b: b.id, decl: i })}"><p class="meta">위스키 · ${b.country}</p><h3>${esc(b.name)}</h3><p class="english">${b.en}</p><div class="row-end"><span>통관일자 2026.09.${24 + i}</span>${arrow()}</div></a>`;
}
function importPage() {
  return clearanceDetail();
}
function content() {
  if (page === 'home') return home();
  if (page === 'explore') return explore();
  if (page === 'whiskey') return whiskey();
  if (page === 'review') return reviewPage();
  if (page === 'write') return writePage();
  if (page === 'profile') return collectionProfile();
  if (page === 'bottle') return collectionProfile();
  if (page === 'history')
    return `${heading('나의 히스토리', '별점과 리뷰, 찜한 순간을 모았어요.')}${searchBar()}<div id="results"></div>`;
  if (page === 'curation') return collectionCuration();
  if (page === 'article') return articlePage();
  if (page === 'imports') return clearanceList();
  if (page === 'import') return importPage();
  if (page === 'reviews')
    return `<div class="reviews-bottle">${bottleRow(bottle)}</div>${tabs(['모든 리뷰', '내 리뷰'], params.get('tab') || '모든 리뷰')}${searchBar('리뷰 내용을 검색하세요')}<div id="results"></div>`;
  if (page === 'importer') return companyDetail();
  if (page === 'settings')
    return `<div class="narrow">${heading('설정')}<section class="settings-group"><h2>계정</h2><a class="more-row" href="${link('edit-profile')}">프로필 수정 ${arrow()}</a><a class="more-row" href="${link('bottle')}">내 기록 ${arrow()}</a></section><section class="settings-group"><h2>화면</h2><label class="more-row">화면 모드<select id="settings-theme"><option value="light" ${theme === 'light' ? 'selected' : ''}>라이트</option><option value="dark" ${theme === 'dark' ? 'selected' : ''}>다크</option></select></label></section><section class="settings-group"><h2>알림</h2>${['댓글 알림', '팔로우 알림'].map((t) => `<label class="more-row">${t}<input type="checkbox" role="switch" checked></label>`).join('')}</section><section class="settings-group"><h2>서비스 정보</h2><a class="more-row" target="_blank" rel="noopener" href="https://bottle-note.com/terms">이용약관 ${arrow()}</a><a class="more-row" target="_blank" rel="noopener" href="https://bottle-note.com/privacy-policy">개인정보 처리방침 ${arrow()}</a></section></div>`;
  if (page === 'login')
    return `<div class="login-page"><img src="${asset('bottle_note_logo.svg')}" alt="Bottle Note"><h1>나만의 위스키 노트</h1><p>별점과 리뷰로 취향을 기록하고<br>다른 사람들의 이야기를 만나보세요.</p><a class="button" target="_blank" rel="noopener" href="https://bottle-note.com/login">보틀노트에서 로그인</a><a class="text-link" href="${link('explore', { state: 'guest' })}">먼저 둘러보기</a></div>`;
  if (page === 'search')
    return `<div class="narrow"><form id="search-form" class="search-box">${icon('search-subcoral')}<input type="search" name="q" aria-label="위스키 검색" placeholder="어떤 위스키를 찾고 있나요?" required><button class="button">검색</button></form>${heading('최근 검색어')}<div class="recent-searches">${['크라이넬리쉬', '스프링뱅크'].map((t) => `<a class="more-row" href="${link('explore', { tab: '위스키', q: t })}">${t}${arrow()}</a>`).join('')}</div></div>`;
  if (page === 'edit-profile')
    return `<form id="profile-form" class="narrow"><img class="profile-avatar" src="${asset('profile-default.svg')}" alt="프로필 사진"><label class="field">닉네임<input name="name" value="${esc(local.name)}" minlength="2" maxlength="20" required></label><button class="button">수정 완료</button></form>`;
  return home();
}
function render() {
  RealUI.clear();
  params = new URLSearchParams(location.search);
  page = window.BN_PAGE || 'home';
  mode = params.get('state') || 'normal';
  bottle = bottles[Number(params.get('b'))] || bottles[0];
  if (page === 'whiskey' && !local.recent.includes(bottle.id))
    local.recent.unshift(bottle.id);
  if ($('#dialog').open) $('#dialog').close();
  document.documentElement.classList.toggle('dark', theme === 'dark');
  $('#app').innerHTML = shell(content());
  document.title =
    (collectionTitle() || pages.find((p) => p[0] === page)?.[1] || '홈') +
    ' · Bottle Note';
  RealUI.upgradeButtons();
  results();
  if (['curation', 'imports', 'history', 'reviews'].includes(page)) {
    const filters = $('#filters');
    if (filters)
      filters.innerHTML =
        '<p class="muted">' +
        {
          curation: '콘텐츠는 최신 등록 순으로 표시됩니다.',
          imports: '수입 내역은 최근 통관일 순으로 표시됩니다.',
          history: '최근 기록부터 표시됩니다.',
          reviews: '리뷰는 최근 작성 순으로 표시됩니다.',
        }[page] +
        '</p>';
  }
  startBanner();
  persist();
}

function captureDraft(form) {
  const f = new FormData(form);
  local.draft = {
    ...local.draft,
    initialized: true,
    b: Number(f.get('b')),
    rating: f.get('rating'),
    content: f.get('content'),
    price: f.get('price'),
    place: f.get('place'),
    unit: f.get('unit'),
    visibility: f.get('visibility'),
    tags: f.getAll('tag'),
  };
}
document.addEventListener('click', (e) => {
  const el = e.target.closest('button,a');
  if (!el) return;
  if (el.matches('[data-banner]')) {
    if (el.dataset.banner === 'pause') bannerPaused = !bannerPaused;
    else bannerIndex = (bannerIndex + 1) % 2;
    updateBanner();
  }
  if (el.matches('[data-share]')) {
    const fallback = () =>
      modal(
        '공유 링크',
        `<input aria-label="공유 링크" readonly value="${esc(location.href)}">`,
      );
    if (navigator.clipboard)
      navigator.clipboard
        .writeText(location.href)
        .then(() => notice('링크를 복사했어요.'))
        .catch(fallback);
    else fallback();
  }
  if (el.matches('.detail-anchor-tabs a')) {
    e.preventDefault();
    document
      .querySelectorAll('.detail-anchor-tabs a')
      .forEach((a) => a.removeAttribute('aria-current'));
    el.setAttribute('aria-current', 'true');
    history.replaceState(null, '', el.getAttribute('href'));
    document
      .querySelector(el.getAttribute('href'))
      ?.scrollIntoView({
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'auto'
          : 'smooth',
      });
  }
  if (el.matches('[data-close]')) $('#dialog').close();
  if (el.matches('[data-theme]')) {
    setTheme(theme === 'dark' ? 'light' : 'dark');
    render();
  }
  if (el.matches('[data-back]')) {
    const back = {
      whiskey: 'explore',
      review: 'explore',
      write: 'whiskey',
      article: 'curation',
      import: 'imports',
      importer: 'imports',
      bottle: 'profile',
      history: 'profile',
      reviews: 'whiskey',
      settings: 'home',
      'edit-profile': 'profile',
      search: 'explore',
      login: 'home',
    };
    go(back[page] || 'home', {
      b: bottle.id,
      ...(page === 'importer' ? { tab: '수입사' } : {}),
    });
  }
  if (el.matches('[data-filter]')) {
    const f = $('#filters');
    f.hidden = !f.hidden;
    el.setAttribute('aria-expanded', String(!f.hidden));
  }
  if (el.matches('[data-pick]')) {
    if (gate()) return;
    const id = Number(el.dataset.pick);
    local.picks.has(id) ? local.picks.delete(id) : local.picks.add(id);
    el.setAttribute('aria-pressed', String(local.picks.has(id)));
    el.innerHTML =
      icon('Bookmark') +
      (el.hasAttribute('data-compact')
        ? ''
        : '<span>' + (local.picks.has(id) ? '찜했어요' : '찜하기') + '</span>');
    notice(local.picks.has(id) ? '마이보틀에 담았어요.' : '찜을 해제했어요.');
    if (['profile', 'bottle'].includes(page) && $('#results')) {
      compactResults($('#results'));
      const count = $('[data-note-count=찜]');
      if (count) count.textContent = local.picks.size;
    }
  }
  if (el.matches('[data-like]')) {
    if (gate()) return;
    const id = el.dataset.like === 'own' ? 'own' : Number(el.dataset.like),
      r = id === 'own' ? local.ownReview : reviews[id];
    local.likes.has(id) ? local.likes.delete(id) : local.likes.add(id);
    el.setAttribute('aria-pressed', String(local.likes.has(id)));
    el.innerHTML =
      icon('history/like_unfilled_subcoral') +
      '좋아요 ' +
      (r.likes + (local.likes.has(id) ? 1 : 0));
  }
  if (el.matches('[data-comments]')) {
    e.preventDefault();
    $('#comments').scrollIntoView({ behavior: 'smooth' });
    $('#comment-input').focus({ preventScroll: true });
  }
  if (el.matches('[data-follow]')) {
    if (gate()) return;
    local.following = !local.following;
    el.textContent = local.following ? '팔로잉' : '팔로우';
    el.setAttribute('aria-pressed', String(local.following));
  }
  if (el.matches('[data-follow-list]'))
    modal(
      el.dataset.followList,
      `<a class="more-row" href="${link('profile', { user: 'other' })}">오늘의한잔 ${arrow()}</a><a class="more-row" href="${link('profile', { user: 'other' })}">잔의기록 ${arrow()}</a>`,
    );
  if (el.matches('[data-apply]'))
    modal(
      '신청 안내',
      `<p>행사의 일정·장소·금액은 디자인 검토를 위한 예시입니다. 이 시안에서는 신청이나 결제가 진행되지 않습니다.</p>`,
    );
  if (el.matches('[data-remove-photo]')) {
    URL.revokeObjectURL(
      local.uploaded.splice(Number(el.dataset.removePhoto), 1)[0],
    );
    $('#photo-previews').innerHTML = photoPreviews();
  }
});
document.addEventListener('input', (e) => {
  if (e.target.id === 'list-search') results();
  if (e.target.closest('#review-form')) {
    captureDraft($('#review-form'));
    if (e.target.name === 'content')
      $('#char-count').textContent = e.target.value.length;
  }
});
document.addEventListener('change', (e) => {
  if (['sort', 'category'].includes(e.target.id)) results();
  if (e.target.id === 'settings-theme') setTheme(e.target.value);
  if (e.target.id === 'photo-input') {
    const files = [...e.target.files].filter((f) =>
      f.type.startsWith('image/'),
    );
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => {
        local.uploaded.push(reader.result);
        $('#photo-previews').innerHTML = photoPreviews();
        persist();
      };
      reader.readAsDataURL(f);
    });
  }
  if (e.target.closest('#review-form')) {
    captureDraft($('#review-form'));
    if (e.target.name === 'b') {
      RealUI.clear($('.write-aside'));
      $('.write-aside').innerHTML =
        '<h2 class="small-heading">기록할 위스키</h2>' +
        bottleRow(bottles[Number(e.target.value)]);
      RealUI.mountAll($('.write-aside'));
    }
  }
});
document.addEventListener('submit', (e) => {
  e.preventDefault();
  const f = e.target;
  if (f.id === 'review-form') {
    captureDraft(f);
    const d = local.draft;
    if (!d.content.trim()) {
      notice('리뷰 내용을 입력해 주세요.');
      f.elements.content.focus();
      return;
    }
    if (!d.rating) {
      notice('별점을 선택해 주세요.');
      document.querySelector('[data-real-ui=rating] button')?.focus();
      return;
    }
    local.ownReview = {
      id: 'own',
      bottle: d.b,
      author: local.name,
      rating: Number(d.rating),
      date: '2026.10.01',
      text: d.content,
      tags: d.tags,
      price: d.price || null,
      unit: d.unit,
      place: d.place,
      likes: 0,
      private: d.visibility === 'private',
      photos: [...local.uploaded],
    };
    local.ratings[d.b] = Number(d.rating);
    go('review', { r: 'own' });
    notice('리뷰를 등록했어요.');
  }
  if (f.id === 'comment-form') {
    if (gate()) return;
    const text = f.elements.comment.value.trim();
    if (!text) return;
    local.comments.push({
      review: f.dataset.review === 'own' ? 'own' : Number(f.dataset.review),
      text,
    });
    render();
    $('#comments').scrollIntoView();
  }
  if (f.id === 'search-form')
    go('explore', { tab: '위스키', q: f.elements.q.value.trim() });
  if (f.id === 'profile-form') {
    const oldName = local.name;
    local.name = f.elements.name.value.trim();
    reviews.forEach((r) => {
      if (r.author === oldName) r.author = local.name;
    });
    if (local.ownReview) local.ownReview.author = local.name;
    go('profile');
    notice('프로필을 수정했어요.');
  }
});
document.addEventListener('product-ui', (e) => {
  const d = e.detail;
  if (d.kind === 'tab') {
    const u = new URL(location.href);
    u.searchParams.set(d.group, d.value);
    history.pushState(null, '', u);
    render();
  }
  if (d.kind === 'search') {
    params.set('q', d.value);
    results();
  }
  if (d.kind === 'rating') {
    if (gate()) return;
    $('#rating-select').value = d.value || '';
    if (page === 'write') captureDraft($('#review-form'));
    else {
      if (d.value) local.ratings[bottle.id] = d.value;
      else delete local.ratings[bottle.id];
      notice(
        d.value
          ? `내 별점 ${d.value.toFixed(1)}점을 남겼어요.`
          : '별점을 지웠어요.',
      );
    }
    persist();
  }
});
window.addEventListener('popstate', render);
window.BN_EXPORT_HREF = (raw) => {
  if (!raw.startsWith('/')) return raw;
  const u = new URL(raw, 'https://bottle-note.com'),
    parts = u.pathname.split('/').filter(Boolean),
    q = Object.fromEntries(u.searchParams);
  if (parts.length === 0) return link('home');
  if (parts[0] === 'explore') {
    if (q.tab === 'EXPLORER_WHISKEY') q.tab = '위스키';
    const map = {
      SINGLE_MALT: '싱글몰트',
      BLENDED_MALT: '블렌디드 몰트',
      BLEND: '블렌디드',
      BLENDED: '블렌디드',
      BOURBON: '아메리칸(버번)',
      AMERICA_BOURBON: '아메리칸(버번)',
      RYE: '라이',
      OTHER: '기타',
      'Single Malt': '싱글몰트',
      Blended: '블렌디드',
      Bourbon: '아메리칸(버번)',
      Rye: '라이',
      'Blended Malt': '블렌디드 몰트',
    };
    if (map[q.category]) q.category = map[q.category];
    return link('explore', q);
  }
  if (parts[0] === 'search' && parts.length >= 3)
    return link(parts[3] === 'reviews' ? 'reviews' : 'whiskey', {
      b: parts[2],
    });
  if (parts[0] === 'review')
    return parts[1] === 'register'
      ? link('write', { ...q, b: q.alcoholId || 0 })
      : link('review', { r: parts[1] || 0 });
  if (parts[0] === 'curation')
    return parts[1] ? link('article', { a: parts[1] }) : link('curation');
  if (parts[0] === 'user')
    return link(
      parts[2] === 'my-bottle'
        ? 'bottle'
        : parts[2] === 'edit'
          ? 'edit-profile'
          : 'profile',
    );
  if (parts[0] === 'import-clearance')
    return parts[1]
      ? link(parts[1] === 'importer' ? 'importer' : 'import', { b: parts[2] })
      : link('imports');
  if (parts[0] === 'settings' || parts[0] === 'login' || parts[0] === 'history')
    return link(parts[0]);
  return 'https://bottle-note.com' + raw;
};
function updateBanner() {
  const target = $('.editorial-banner');
  if (target) target.outerHTML = banner();
  startBanner();
}
function startBanner() {
  clearInterval(bannerTimer);
  if (
    page === 'home' &&
    !bannerPaused &&
    !matchMedia('(prefers-reduced-motion: reduce)').matches
  )
    bannerTimer = setInterval(() => {
      if (
        document.hidden ||
        $('.editorial-banner:hover') ||
        $('.editorial-banner:focus-within')
      )
        return;
      bannerIndex = (bannerIndex + 1) % 2;
      updateBanner();
    }, 6500);
}
setTheme(theme);
render();

/* Refined collection pages. Uses the same illustrative records and source UI primitives. */
function collectionTitle() {
  return page === 'explore'
    ? params.get('tab') === '리뷰'
      ? '리뷰'
      : '둘러보기'
    : ['profile', 'bottle'].includes(page) && params.get('user') !== 'other'
      ? '마이보틀'
      : null;
}
function compactSearch(placeholder, action = '') {
  return `<div class="collection-search">${slot('search', { placeholder, value: params.get('q') || '' })}${action}</div>`;
}
function collectionSort(review = false) {
  return `<label class="collection-sort"><span class="sr-only">정렬</span><select id="collection-sort"><option value="recent" ${params.get('sort') !== 'rating' ? 'selected' : ''}>최신순</option><option value="rating" ${params.get('sort') === 'rating' ? 'selected' : ''}>${review ? '별점' : '평점'} 높은 순</option></select></label>`;
}
function collectionExplore() {
  const isReview = params.get('tab') === '리뷰';
  return `<div class="collection-top">${compactSearch(isReview ? '위스키 이름이나 리뷰를 검색하세요' : '어떤 위스키를 찾으세요?', isReview ? `<a class="write-shortcut" aria-label="리뷰 쓰기" href="${link('write')}">${icon('NotebookPen')}<span>리뷰 쓰기</span></a>` : `<a class="imports-shortcut" href="${link('imports')}" aria-label="수입통관">${icon('Package')}<span>수입통관</span></a>`)}${isReview ? '' : `<nav class="category-chips" aria-label="위스키 카테고리">${[['', '전체'], ...categories.map(([c]) => [c, c])].map(([v, label]) => `<button data-category="${esc(v)}" aria-pressed="${(params.get('category') || '') === v}">${label}</button>`).join('')}</nav>`}</div><div class="collection-result-bar"><h2>${isReview ? '새로 남긴 리뷰' : '위스키'} <span data-result-count></span></h2>${collectionSort(isReview)}</div>${params.get('country') ? `<p class="applied-filter">${esc(params.get('country'))} <a href="${link('explore', { tab: '위스키' })}">해제</a></p>` : ''}<div class="${isReview ? 'feed-layout' : 'catalog-layout'}"><div id="results"></div>${isReview ? feedAside() : ''}</div>`;
}
function feedAside() {
  return `<aside class="feed-aside"><section><div class="aside-heading"><h2>최근 본 위스키</h2>${icon('History')}</div>${local.recent
    .slice(0, 3)
    .map((id) => {
      const b = bottles[id];
      return `<a class="aside-bottle" href="${link('whiskey', { b: id })}">${image(b)}<div><h3>${esc(b.name)}</h3>${score(b.rating)}</div>${icon('ChevronRight')}</a>`;
    })
    .join(
      '',
    )}</section><a class="aside-note-link" href="${link('profile')}">${icon('NotebookPen')}<div><b>내 노트 이어 쓰기</b><span>마신 위스키의 기록을 모아보세요.</span></div>${icon('ArrowUpRight')}</a></aside>`;
}
function feedReview(r) {
  const b = bottles[r.bottle];
  return `<article class="feed-note"><header><a class="feed-author" href="${link('profile', { user: r.author === local.name ? 'me' : 'other' })}"><img class="avatar" src="${asset('profile-default.svg')}" alt=""><b>${esc(r.author)}</b></a><time>${r.date}</time>${r.private ? '<span class="private-label">나만 보기</span>' : ''}${score(r.rating)}</header><div class="feed-content"><a class="feed-bottle-image" href="${link('whiskey', { b: b.id })}" aria-label="${esc(b.name)} 상세">${image(b)}</a><div class="feed-text"><a class="feed-product-name" href="${link('whiskey', { b: b.id })}">${esc(b.name)} ${icon('ChevronRight')}</a><a class="feed-body" href="${link('review', { r: r.id })}">${esc(r.text.split('\n\n')[0])}</a>${tags(r.tags)}</div></div><footer><button data-like="${r.id}" aria-pressed="${local.likes.has(r.id)}">${icon('history/like_unfilled_subcoral')}좋아요 ${r.likes + (local.likes.has(r.id) ? 1 : 0)}</button><a href="${link('review', { r: r.id })}#comments">${icon('comment-outlined-subcoral')}댓글 ${1 + local.comments.filter((c) => c.review === r.id).length}</a><a class="feed-read" href="${link('review', { r: r.id })}">노트 읽기 ${icon('ArrowUpRight')}</a></footer></article>`;
}
function catalogBottle(b) {
  return `<div class="catalog-bottle">${bottleRow(b)}<div class="catalog-flavors">${b.tags.length ? tags(b.tags.slice(0, 3)) : `<span class="muted">${esc(b.region)}</span>`}</div></div>`;
}
function collectionCuration() {
  const tab = params.get('tab') || '전체';
  return `<div class="curation-top">${tabs(['전체', '시음회', '프로그램', '큐레이션'], tab)}${compactSearch('시음회나 읽을거리를 찾아보세요')}</div><div class="collection-result-bar"><h2>${tab === '전체' ? '시음회와 읽을거리' : tab}<span data-result-count></span></h2><span class="subtle-label">${tab === '전체' || tab === '시음회' || tab === '프로그램' ? '다가오는 일정부터' : '보틀노트 큐레이션'}</span></div><div id="results"></div>`;
}
function eventCard(a) {
  return `<a class="event-entry" href="${link('article', { a: a.id })}"><img class="event-cover" src="${asset(a.image)}" alt=""><div class="event-content"><p class="content-kind">${a.type}</p><h3>${a.title}</h3><p class="event-description">${a.subtitle}</p><dl><div><dt>${icon('CalendarDays')}<span class="sr-only">일시</span></dt><dd>${a.date}</dd></div><div><dt>${icon('MapPin')}<span class="sr-only">장소</span></dt><dd>${a.place}</dd></div></dl><div class="event-bottom"><span>${a.bottles.length}종 테이스팅</span><b>${a.fee}</b>${icon('ArrowUpRight')}</div></div></a>`;
}
function editorialCard(a) {
  return `<a class="reading-entry" href="${link('article', { a: a.id })}"><img src="${asset(a.image)}" alt=""><div><span class="content-kind">큐레이션</span><h3>${a.title}</h3><p>${a.subtitle}</p></div>${icon('ArrowUpRight')}</a>`;
}
function collectionProfile() {
  const other = params.get('user') === 'other';
  if (other) return legacyProfile();
  const counts = {
    별점: mode === 'empty' ? 0 : Object.keys(local.ratings).length,
    리뷰:
      mode === 'empty'
        ? 0
        : reviews.filter((r) => r.author === local.name).length +
          (local.ownReview ? 1 : 0),
    찜: mode === 'empty' ? 0 : local.picks.size,
  };
  const tab = params.get('tab') || (page === 'bottle' ? '별점' : '전체');
  return `<section class="notebook-profile"><img class="profile-avatar" src="${asset('profile-default.svg')}" alt=""><div class="notebook-person"><h1>${esc(local.name)}</h1><div class="follow-line"><button data-follow-list="팔로워">팔로워 <b>12</b></button><button data-follow-list="팔로잉">팔로잉 <b>8</b></button></div></div><a class="profile-edit" href="${link('edit-profile')}" aria-label="프로필 수정">${icon('Settings2')}<span>프로필 수정</span></a><div class="notebook-counts">${Object.entries(
    counts,
  )
    .map(
      ([name, n]) =>
        `<a href="${link(page, { tab: name })}"><b data-note-count="${name}">${n}</b><span>${name}</span></a>`,
    )
    .join(
      '',
    )}</div></section><div class="notebook-tools"><a href="${link('history')}">${icon('History')}나의 히스토리 ${icon('ChevronRight')}</a><a href="${link('write')}">${icon('NotebookPen')}리뷰 쓰기 ${icon('ArrowUpRight')}</a></div><section class="my-notebook">${tabs(['전체', '별점', '리뷰', '찜'], tab)}${compactSearch('내 노트에서 위스키 찾기')}<div class="collection-result-bar"><h2>${tab === '전체' ? '내가 남긴 노트' : tab === '별점' ? '별점을 남긴 위스키' : tab === '리뷰' ? '내가 쓴 리뷰' : '찜한 위스키'} <span data-result-count></span></h2><span class="subtle-label">${tab === '찜' ? '마셔보고 싶은 한 병' : '한 잔씩 쌓이는 취향'}</span></div><div id="results"></div></section>`;
}
function recordEntry(b) {
  const r =
      (local.ownReview?.bottle === b.id ? local.ownReview : null) ||
      reviews.find((r) => r.author === local.name && r.bottle === b.id),
    myRating = local.ratings[b.id];
  return `<article class="record-entry"><div class="record-top"><a class="record-product" href="${link('whiskey', { b: b.id })}">${image(b)}<div><span class="meta">${esc(b.category)} · ${esc(b.country)}</span><h3>${esc(b.name)}</h3><p class="english">${esc(b.en)}</p><div class="record-rating">${myRating ? `<span>내 별점</span>${score(myRating)}` : `<span>아직 별점이 없어요</span>`}</div></div></a><button class="icon-button entry-save" data-pick="${b.id}" data-compact aria-pressed="${local.picks.has(b.id)}" aria-label="${esc(b.name)} 찜">${icon('Bookmark')}</button></div>${r ? `<a class="record-excerpt" href="${link('review', { r: r.id })}"><span>${icon('NotebookPen')} ${r.private ? '나만의 리뷰' : '나의 리뷰'}</span><p>${esc(r.text.split('\n\n')[0])}</p><footer><time>${r.date}</time>${icon('ArrowUpRight')}</footer></a>` : `<a class="record-add" href="${link('write', { b: b.id })}">${icon('NotebookPen')}한 줄 기록 남기기 ${icon('ArrowUpRight')}</a>`}</article>`;
}
function compactResults(target) {
  const q = (params.get('q') || '').trim().toLowerCase(),
    tab =
      params.get('tab') ||
      (page === 'explore' ? '위스키' : page === 'bottle' ? '별점' : '전체'),
    sort = params.get('sort') || 'recent';
  let html = '',
    count = 0;
  if (page === 'curation') {
    let list =
      mode === 'empty'
        ? []
        : articles.filter(
            (a) =>
              (tab === '전체' || a.type === tab) &&
              (a.title + a.subtitle + (a.place || ''))
                .toLowerCase()
                .includes(q),
          );
    count = list.length;
    const events = list
        .filter((a) => a.date)
        .sort((a, b) => a.date.localeCompare(b.date)),
      reads = list.filter((a) => !a.date);
    html = `<div class="curation-collections ${events.length && reads.length ? 'has-both' : ''}">${events.length ? `<section class="event-list">${tab === '전체' ? '<h3 class="collection-section-label">함께 마시는 자리</h3>' : ''}${events.map(eventCard).join('')}</section>` : ''}${reads.length ? `<section class="reading-list">${tab === '전체' ? '<h3 class="collection-section-label">읽을거리</h3>' : ''}${reads.map(editorialCard).join('')}</section>` : ''}</div>`;
  } else if (
    (page === 'explore' && tab === '리뷰') ||
    (['profile', 'bottle'].includes(page) && tab === '리뷰')
  ) {
    let list = [...(local.ownReview ? [local.ownReview] : []), ...reviews]
      .filter((r) =>
        page === 'explore' ? !r.private : r.author === local.name,
      )
      .filter((r) =>
        (r.text + bottles[r.bottle].name).toLowerCase().includes(q),
      );
    if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);
    if (mode === 'empty') list = [];
    count = list.length;
    html = `<div class="note-feed">${list.map(feedReview).join('')}</div>`;
  } else {
    let list = bottles.filter((b) => (b.name + b.en).toLowerCase().includes(q));
    if (page === 'explore')
      list = list.filter(
        (b) =>
          (!params.get('category') || b.category === params.get('category')) &&
          (!params.get('country') || b.country === params.get('country')),
      );
    else
      list = list.filter((b) =>
        tab === '찜'
          ? local.picks.has(b.id)
          : tab === '별점'
            ? local.ratings[b.id] !== undefined
            : local.picks.has(b.id) ||
              local.ratings[b.id] !== undefined ||
              local.ownReview?.bottle === b.id,
      );
    if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);
    if (mode === 'empty') list = [];
    count = list.length;
    html = `<div class="${page === 'explore' ? 'catalog-grid' : 'record-grid'}">${list.map(page === 'explore' ? catalogBottle : recordEntry).join('')}</div>`;
  }
  if (!count)
    html = empty(
      q
        ? '검색 결과가 없어요'
        : page === 'curation'
          ? '아직 등록된 소식이 없어요'
          : '아직 남긴 기록이 없어요',
      q
        ? '검색어나 분류를 바꿔보세요.'
        : '위스키를 둘러보고 첫 기록을 남겨보세요.',
    );
  RealUI.clear(target);
  target.innerHTML = html;
  RealUI.upgradeButtons(target);
  const label = $('[data-result-count]');
  if (label) label.textContent = count;
}
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-category]');
  if (!el) return;
  params.set('category', el.dataset.category);
  const u = new URL(location.href);
  u.searchParams.set('category', el.dataset.category);
  history.replaceState(null, '', u);
  document
    .querySelectorAll('[data-category]')
    .forEach((b) => b.setAttribute('aria-pressed', String(b === el)));
  results();
});
document.addEventListener('change', (e) => {
  if (e.target.id === 'collection-sort') {
    params.set('sort', e.target.value);
    const u = new URL(location.href);
    u.searchParams.set('sort', e.target.value);
    history.replaceState(null, '', u);
    results();
  }
});

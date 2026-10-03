/* Static design fixtures only. No API requests, authentication, or production data. */
const importCompanies = [
  { id: 0, name: '보틀트레이딩', place: '서울', status: '영업 중' },
  { id: 1, name: '몰트컴퍼니', place: '서울', status: '영업 중' },
];
function declarationFor(b, offset = 0) {
  return {
    b,
    offset,
    company: importCompanies[b.id % 2],
    date: `2026-09-${String(24 + b.id + offset).padStart(2, '0')}`,
  };
}
function clearanceHref(d) {
  return link('import', { b: d.b.id, decl: d.offset });
}
function clearanceRow(d) {
  return `<article class="clearance-entry catalog-bottle"><a class="clearance-main entry-main" href="${clearanceHref(d)}">${image(d.b)}<div class="clearance-copy entry-copy"><p class="meta">${d.b.category} · ${d.b.country}</p><h3>${esc(d.b.name)}</h3><p class="english">${esc(d.b.en)}</p><p class="clearance-date"><span>통관일</span><time datetime="${d.date}">${d.date.replaceAll('-', '.')}</time></p></div>${icon('ChevronRight')}</a><a class="clearance-company" href="${link('importer', { company: d.company.id })}"><span>수입사</span><b>${d.company.name}</b>${icon('ArrowUpRight')}</a></article>`;
}
function companyEntry(c) {
  const records = bottles
    .filter((b) => b.id % 2 === c.id)
    .map((b) => declarationFor(b))
    .sort((a, b) => b.date.localeCompare(a.date));
  return `<a class="company-entry" href="${link('importer', { company: c.id })}"><div class="company-entry-top"><div class="company-symbol">${icon('Package')}</div><div><p class="meta">주류 수입사 · ${c.place}</p><h3>${c.name}</h3><p class="company-location">${c.status}<span>최근 통관 ${records[0].date.replaceAll('-', '.')}</span></p></div>${icon('ChevronRight')}</div><div class="company-preview"><span>수입 위스키</span><p>${records
    .slice(0, 2)
    .map((d) => d.b.name)
    .join(' · ')}</p></div></a>`;
}
function clearanceList() {
  const companies = params.get('tab') === '수입사';
  return `<div class="clearance-top">${tabs(['수입 내역', '수입사'], companies ? '수입사' : '수입 내역')}${compactSearch(companies ? '수입사 이름을 검색하세요' : '품목명 또는 수입사를 검색하세요', companies ? '' : `<button class="icon-button clearance-filter-button" data-clearance-filter aria-label="통관 필터" aria-expanded="false" aria-controls="clearance-filters">${icon('SlidersHorizontal')}</button>`)}</div>${companies ? '' : `<section class="clearance-filters" id="clearance-filters" hidden><label>시작일<input type="date" id="clearance-from" value="${esc(params.get('from') || '')}"></label><label>종료일<input type="date" id="clearance-to" value="${esc(params.get('to') || '')}"></label><label>제조국<select id="clearance-country"><option value="">전체</option>${[...new Set(bottles.map((b) => b.country))].map((c) => `<option ${params.get('country') === c ? 'selected' : ''}>${c}</option>`).join('')}</select></label><button data-clearance-reset>초기화</button><p id="clearance-date-error" role="status" hidden>종료일을 시작일 이후로 선택해 주세요.</p></section>`}<div class="collection-result-bar"><h2>${companies ? '수입사' : '수입 내역'} <span data-result-count></span></h2>${companies ? '<span class="subtle-label">수입사별 내역 보기</span>' : `<label class="collection-sort"><span class="sr-only">통관일 정렬</span><select id="clearance-sort"><option value="new">최근 통관순</option><option value="old" ${params.get('order') === 'old' ? 'selected' : ''}>오래된 순</option></select></label>`}</div><div id="results"></div>`;
}
function clearanceResults(target) {
  const q = (params.get('q') || '').trim().toLowerCase(),
    companies = params.get('tab') === '수입사';
  let list, html;
  if (companies) {
    list = importCompanies.filter((c) => c.name.includes(q));
    html = `<div class="company-grid">${list.map(companyEntry).join('')}</div>`;
  } else {
    const from = $('#clearance-from')?.value,
      to = $('#clearance-to')?.value,
      country = $('#clearance-country')?.value;
    const invalid = !!(from && to && from > to);
    $('#clearance-date-error').hidden = !invalid;
    list = invalid
      ? []
      : bottles
          .map((b) => declarationFor(b))
          .filter(
            (d) =>
              (d.b.name + d.b.en + d.company.name).toLowerCase().includes(q) &&
              (!from || d.date >= from) &&
              (!to || d.date <= to) &&
              (!country || d.b.country === country),
          );
    list.sort((a, b) =>
      $('#clearance-sort')?.value === 'old'
        ? a.date.localeCompare(b.date)
        : b.date.localeCompare(a.date),
    );
    html = `<div class="clearance-grid">${list.map(clearanceRow).join('')}</div>`;
  }
  if (mode === 'empty') list = [];
  if (!list.length)
    html = `<div class="empty clearance-empty">${icon('Search')}<h2>${companies ? '검색된 수입사가 없어요' : '조건에 맞는 수입 내역이 없어요'}</h2><p>검색어나 ${companies ? '수입사 이름' : '기간·제조국'}을 바꿔 다시 확인해 보세요.</p><button class="button secondary" data-clearance-reset>전체 보기</button></div>`;
  RealUI.clear(target);
  target.innerHTML = html;
  RealUI.upgradeButtons(target);
  $('[data-result-count]').textContent = list.length;
}
function clearanceDetail() {
  const d = declarationFor(
      bottle,
      Math.max(-2, Math.min(0, Number(params.get('decl')) || 0)),
    ),
    b = d.b;
  return `<nav class="clearance-breadcrumb" aria-label="현재 위치"><a href="${link('imports')}">수입통관</a>${icon('ChevronRight')}<span>수입 내역</span></nav><header class="clearance-heading"><a href="${link('whiskey', { b: b.id })}" aria-label="${esc(b.name)} 위스키 노트">${image(b)}</a><div><p class="meta">${b.category} · ${b.country}</p><h1>${esc(b.name)}</h1><p class="english">${esc(b.en)}</p><a class="text-link" href="${link('whiskey', { b: b.id })}">위스키 노트 보기 ${icon('ArrowUpRight')}</a></div></header><div class="clearance-detail-grid"><section><h2 class="clearance-section-title">통관 정보</h2>${rows(
    [
      ['제조사', b.distillery ? esc(b.distillery) : null],
      ['제조국', b.country],
      ['수출국', b.country],
      ['통관일자', d.date.replaceAll('-', '.')],
    ],
  )}</section><section class="clearance-importer-block"><h2 class="clearance-section-title">수입사</h2>${mode === 'guest' ? `<div class="login-gate"><p>로그인하고 수입사 정보를 확인하세요.</p>${button('로그인하기', 'login')}</div>` : companyEntry(d.company)}</section></div><section class="clearance-related"><div class="collection-result-bar"><h2>같은 위스키의 다른 통관 내역</h2><span class="subtle-label">통관일 기준</span></div><div class="clearance-grid">${[
    -2,
  ]
    .filter((n) => n !== d.offset)
    .map((n) => clearanceRow(declarationFor(b, n)))
    .join('')}</div></section>`;
}
function companyDetail() {
  const c = importCompanies[Number(params.get('company')) === 1 ? 1 : 0];
  return `<nav class="clearance-breadcrumb" aria-label="현재 위치"><a href="${link('imports', { tab: '수입사' })}">수입사</a>${icon('ChevronRight')}<span>${c.name}</span></nav><header class="company-heading"><div class="company-symbol">${icon('Package')}</div><div><p class="content-kind">주류 수입사</p><h1>${c.name}</h1><p>${icon('MapPin')}${c.place}<span>${c.status}</span></p></div></header>${compactSearch('이 수입사의 품목을 검색하세요')}<div class="collection-result-bar"><h2>최근 수입 내역 <span data-result-count></span></h2><span class="subtle-label">최근 통관순</span></div><div id="results"></div>`;
}
function companyResults(target) {
  const id = Number(params.get('company')) === 1 ? 1 : 0,
    q = (params.get('q') || '').trim().toLowerCase();
  const list =
    mode === 'empty'
      ? []
      : bottles
          .filter(
            (b) => b.id % 2 === id && (b.name + b.en).toLowerCase().includes(q),
          )
          .map((b) => declarationFor(b))
          .sort((a, b) => b.date.localeCompare(a.date));
  RealUI.clear(target);
  target.innerHTML = list.length
    ? `<div class="clearance-grid">${list.map(clearanceRow).join('')}</div>`
    : `<div class="empty"><h2>검색된 수입 내역이 없어요</h2><p>품목명을 바꿔 검색해 보세요.</p></div>`;
  RealUI.upgradeButtons(target);
  $('[data-result-count]').textContent = list.length;
}
document.addEventListener('click', (e) => {
  const el = e.target.closest('button');
  if (!el) return;
  if (el.hasAttribute('data-clearance-filter')) {
    const panel = $('#clearance-filters');
    panel.hidden = !panel.hidden;
    el.setAttribute('aria-expanded', String(!panel.hidden));
  }
  if (el.hasAttribute('data-clearance-reset')) {
    const u = new URL(location.href);
    for (const key of ['q', 'from', 'to', 'country', 'order', 'state'])
      u.searchParams.delete(key);
    history.replaceState(null, '', u);
    render();
  }
});
document.addEventListener('change', (e) => {
  const key = {
    'clearance-from': 'from',
    'clearance-to': 'to',
    'clearance-country': 'country',
    'clearance-sort': 'order',
  }[e.target.id];
  if (key) {
    params.set(key, e.target.value);
    const u = new URL(location.href);
    u.searchParams.set(key, e.target.value);
    history.replaceState(null, '', u);
    results();
  }
});

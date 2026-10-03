import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import BookmarkTab from '../../../src/components/ui/Navigation/Tab/variants/BookmarkTab';
import Button, {
  buttonVariants,
} from '../../../src/components/ui/Button/Button';
import { SubHeader } from '../../../src/components/ui/Navigation/SubHeader';
import Navbar from '../../../src/components/ui/Navigation/Navbar';
import Label from '../../../src/components/ui/Display/Label';
import Star from '../../../src/components/ui/Display/Star';
import StarRating from '../../../src/components/ui/Form/StarRating';
import SearchBar from '../../../src/components/feature/Search/SearchBar';
import HomeCarousel from '../../../src/components/feature/home/HomeCarousel';
import CategoryList from '../../../src/components/feature/home/CategoryList';
import { HomeFeaturedItemList } from '../../../src/components/feature/home/_components/HomeFeaturedItemList';
import { HomeFeaturedDescription } from '../../../src/components/feature/home/_components/HomeFeaturedDescription';
import { MbtiPromoCard } from '../../../src/components/feature/home/MbtiPromoCard';
import ListItemLayout from '../../../src/components/feature/List/ListItemLayout';
import ItemImage from '../../../src/components/feature/List/_components/ItemImage';
import ItemInfo from '../../../src/components/feature/List/_components/ItemInfo';
import { StickyBottomCta } from '../../../src/components/ui/Layout/StickyBottomCta';
import { Link, Image } from './next-compat';

const roots = new Map();
const emit = (kind, detail) =>
  document.dispatchEvent(
    new CustomEvent('product-ui', { detail: { kind, ...detail } }),
  );
function Rating({ value }) {
  const [rate, setRate] = useState(Number(value) || 0);
  return (
    <StarRating
      rate={rate}
      handleRate={(v) => {
        setRate(v);
        emit('rating', { value: v });
      }}
    />
  );
}
function Header({ title, home, back }) {
  return (
    <SubHeader>
      <SubHeader.Left>
        {home ? (
          <SubHeader.Logo />
        ) : (
          <button
            type="button"
            aria-label="뒤로"
            onClick={() =>
              history.length > 1 ? history.back() : location.assign(back)
            }
          >
            <Image
              src="/icon/arrow-left-subcoral.svg"
              width={24}
              height={24}
              alt=""
            />
          </button>
        )}
      </SubHeader.Left>
      {!home && <SubHeader.Center>{title}</SubHeader.Center>}
      <SubHeader.Right>
        <div className="flex items-center gap-x-12">
          <Link href="/user/1" aria-label="마이보틀">
            <Image
              src="/icon/user-outlined-subcoral.svg"
              width={22}
              height={22}
              alt=""
            />
          </Link>
          <SubHeader.Menu />
        </div>
      </SubHeader.Right>
    </SubHeader>
  );
}
function Banner({ assets }) {
  const base = {
    posterUrl: null,
    mediaType: 'IMAGE',
    bannerType: 'CURATION',
    startDate: null,
    endDate: null,
    textPosition: 'LB',
  };
  return (
    <HomeCarousel
      banners={[
        {
          ...base,
          id: 1,
          name: '보틀노트 인스타그램',
          nameFontColor: '#ffffff',
          descriptionFontColor: '#ffffff',
          descriptionA: '보틀노트 너머의 이야기를',
          descriptionB: '인스타그램에서',
          imageUrl: assets + 'banner-magazine.png',
          targetUrl: 'https://www.instagram.com/bottle_note_official/',
          isExternalUrl: true,
          sortOrder: 1,
        },
        {
          ...base,
          id: 2,
          name: '가을의 위스키',
          nameFontColor: '#252525',
          descriptionFontColor: '#252525',
          descriptionA: '따스함에서 서늘함으로',
          descriptionB: '건너가는 시간',
          imageUrl: assets + 'banner-autumn.webp',
          targetUrl: '/curation/0',
          isExternalUrl: false,
          sortOrder: 2,
        },
      ]}
    />
  );
}
function ActualBottle({ b, href, extra }) {
  return (
    <ListItemLayout>
      <Link href={href} className="flex w-full items-center gap-12">
        <ItemImage src={'assets/' + b.image} alt={b.name} />
        <div className="flex-1 min-w-0 space-y-8">
          <ItemInfo
            korName={b.name}
            engName={b.en}
            korCategory={b.category}
            length={null}
          />
          <div className="flex items-center gap-8">
            <Star rating={b.rating} />
            <span className="text-12 text-fg-neutral-muted">
              {extra || '전체 평점'}
            </span>
          </div>
        </div>
      </Link>
    </ListItemLayout>
  );
}
function Component({ kind, props: p }) {
  if (kind === 'tabs') {
    const list = p.items.map((name, i) => ({ id: p.group + '-' + i, name }));
    return (
      <BookmarkTab
        currentTab={list.find((t) => t.name === p.value) || list[0]}
        tabList={list}
        handleTab={(id) =>
          emit('tab', {
            group: p.group,
            value: list.find((t) => t.id === id).name,
          })
        }
      />
    );
  }
  if (kind === 'header') return <Header {...p} />;
  if (kind === 'nav') return <Navbar />;
  if (kind === 'banner') return <Banner {...p} />;
  if (kind === 'categories') return <CategoryList />;
  if (kind === 'promo') return <MbtiPromoCard />;
  if (kind === 'featured')
    return (
      <>
        <HomeFeaturedDescription
          type={p.type || 'view-week'}
          nickname="오크향기"
        />
        <HomeFeaturedItemList
          items={p.bottles.map((b) => ({
            alcoholId: b.id,
            korName: b.name,
            engName: b.en,
            engCategory: b.category === '싱글몰트' ? 'Single Malt' : b.category,
            rating: b.rating,
            imageUrl: 'assets/' + b.image,
            path: p.links[b.id],
          }))}
        />
      </>
    );
  if (kind === 'bottle') return <ActualBottle {...p} />;
  if (kind === 'score')
    return <Star rating={Number(p.value)} size={p.size || 18} />;
  if (kind === 'tags')
    return (
      <div className="flex flex-wrap gap-6">
        {p.items.map((t) => (
          <Label
            key={t}
            name={t}
            styleClass="border-stroke-brand-weak text-fg-brand px-8 py-4 rounded-sm text-12"
          />
        ))}
      </div>
    );
  if (kind === 'rating') return <Rating {...p} />;
  if (kind === 'search')
    return (
      <SearchBar
        initialValue={p.value}
        placeholder={p.placeholder}
        onValueChange={(value) => emit('search', { value })}
        handleSearch={(value) => emit('search', { value })}
      />
    );
  if (kind === 'button')
    return p.href ? (
      <Link
        href={p.href}
        className={buttonVariants({
          size: p.size || 'md',
          variant: p.secondary ? 'secondary' : 'primary',
          fullWidth: p.fullWidth ?? false,
        })}
        {...p.attrs}
      >
        <span dangerouslySetInnerHTML={{ __html: p.html }} />
      </Link>
    ) : (
      <Button
        size={p.size || 'md'}
        variant={p.secondary ? 'secondary' : 'primary'}
        fullWidth={p.fullWidth ?? false}
        {...p.attrs}
      >
        <span dangerouslySetInnerHTML={{ __html: p.html }} />
      </Button>
    );
  if (kind === 'cta')
    return (
      <StickyBottomCta
        label={p.label}
        onClick={() => document.querySelector('#review-form')?.requestSubmit()}
      />
    );
  return null;
}
export function clear(scope = document) {
  for (const [el, root] of roots) {
    if (scope === document || scope.contains(el) || !el.isConnected) {
      root.unmount();
      roots.delete(el);
    }
  }
}
export function mountAll(scope = document) {
  for (const el of scope.querySelectorAll('[data-real-ui]')) {
    if (roots.has(el)) continue;
    const root = createRoot(el);
    roots.set(el, root);
    const props = JSON.parse(el.getAttribute('data-props') || '{}');
    flushSync(() =>
      root.render(<Component kind={el.dataset.realUi} props={props} />),
    );
    if (el.dataset.realUi === 'tabs')
      for (const b of el.querySelectorAll('button'))
        b.setAttribute('aria-pressed', String(b.textContent === props.value));
  }
}
export function upgradeButtons(scope = document) {
  for (const el of [...scope.querySelectorAll('.button')]) {
    if (el.closest('[data-real-ui]')) continue;
    const props = {
      html: el.innerHTML,
      secondary: el.classList.contains('secondary'),
      href: el.tagName === 'A' ? el.getAttribute('href') : undefined,
      attrs: {},
      size: el.closest('.form-footer') ? 'lg' : 'md',
      fullWidth: !!el.closest('.form-footer'),
    };
    for (const attr of el.attributes)
      if (
        attr.name.startsWith('data-') ||
        attr.name.startsWith('aria-') ||
        ['id', 'type', 'name', 'value'].includes(attr.name)
      )
        props.attrs[attr.name] = attr.value;
    if (el.tagName === 'BUTTON') props.attrs.type = el.type;
    const slot = document.createElement('span');
    slot.className = 'real-button';
    slot.dataset.realUi = 'button';
    slot.dataset.props = JSON.stringify(props);
    el.replaceWith(slot);
  }
  mountAll(scope);
}

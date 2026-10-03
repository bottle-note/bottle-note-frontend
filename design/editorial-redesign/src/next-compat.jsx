// Static export boundary: Next routing/image services become native page links/images.
// Product component sources, auth state, API clients and tokens are not replaced.
import React, { forwardRef } from 'react';
export function exportHref(input) {
  const raw =
    typeof input === 'string'
      ? input
      : input.pathname +
        (input.query ? '?' + new URLSearchParams(input.query) : '');
  if (!raw || /^(https?:|mailto:|data:|blob:)/.test(raw)) return raw;
  return window.BN_EXPORT_HREF ? window.BN_EXPORT_HREF(raw) : raw;
}
export function imageHref(input) {
  const src = typeof input === 'string' ? input : input?.src;
  return src?.startsWith('/') ? 'assets/public' + src : src;
}
export const Image = forwardRef(function ExportImage(
  {
    src,
    alt = '',
    fill,
    priority,
    quality,
    unoptimized,
    placeholder,
    blurDataURL,
    loader,
    onLoadingComplete,
    style,
    ...rest
  },
  ref,
) {
  return (
    <img
      ref={ref}
      {...rest}
      alt={alt}
      src={imageHref(src)}
      style={{
        ...(fill
          ? { position: 'absolute', inset: 0, width: '100%', height: '100%' }
          : {}),
        ...style,
      }}
    />
  );
});
export const Link = forwardRef(function ExportLink(
  {
    href,
    prefetch,
    replace,
    scroll,
    legacyBehavior,
    passHref,
    children,
    ...props
  },
  ref,
) {
  return (
    <a ref={ref} href={exportHref(href)} {...props}>
      {children}
    </a>
  );
});
export function usePathname() {
  return window.BN_PRODUCT_PATH || '/';
}
export function useSearchParams() {
  return new URLSearchParams(location.search);
}
export function useRouter() {
  return {
    push: (href) => location.assign(exportHref(href)),
    replace: (href) => location.replace(exportHref(href)),
    back: () => history.back(),
    refresh: () => location.reload(),
    prefetch: () => Promise.resolve(),
  };
}
export function useParams() {
  return {};
}

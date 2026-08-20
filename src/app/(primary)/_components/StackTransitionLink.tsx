'use client';

import type { ComponentProps, MouseEvent } from 'react';
import Link from 'next/link';
import { useStackTransition } from './StackTransitionProvider';

type Props = ComponentProps<typeof Link>;

const shouldPreserveBrowserNavigation = (
  event: MouseEvent<HTMLAnchorElement>,
) => {
  const target = event.currentTarget.getAttribute('target');
  return (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.currentTarget.hasAttribute('download') ||
    Boolean(target && target !== '_self')
  );
};

export default function StackTransitionLink({
  href,
  onClick,
  replace,
  scroll,
  ...props
}: Props) {
  const stackTransition = useStackTransition();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);

    if (
      event.defaultPrevented ||
      replace ||
      typeof href !== 'string' ||
      shouldPreserveBrowserNavigation(event) ||
      !stackTransition?.canPush(href)
    ) {
      return;
    }

    event.preventDefault();
    stackTransition.push(href, { scroll });
  };

  return (
    <Link
      {...props}
      href={href}
      replace={replace}
      scroll={scroll}
      onClick={handleClick}
      data-stack-transition-link="push"
    />
  );
}

import Button, { buttonVariants } from '@/components/ui/Button/Button';

/**
 * 이 컴포넌트를 렌더하는 화면의 스크롤 루트에는 반드시 이 클래스를 페어로
 * 줘야 한다. 안 그러면 마지막 콘텐츠가 이 고정 바에 가려진다.
 */
export const STICKY_BOTTOM_CTA_PADDING_CLASS = 'pb-[var(--sticky-cta-space)]';

type StickyBottomCtaProps =
  | { label: string; disabled?: boolean; onClick: () => void; href?: never }
  | { label: string; disabled?: boolean; href: string; onClick?: never };

/** 내비바 위에 떠 있는 화면 하단 고정 CTA. onClick은 내부 액션, href는 외부링크용. */
export function StickyBottomCta(props: StickyBottomCtaProps) {
  const { label, disabled } = props;

  return (
    <div
      className="fixed-content z-20 px-20"
      style={{ bottom: 'var(--navbar-margin-bottom)' }}
    >
      {typeof props.href !== 'string' || disabled ? (
        <Button btnName={label} onClick={props.onClick} disabled={disabled} />
      ) : (
        <a
          href={props.href}
          target="_blank"
          rel="noreferrer"
          className={buttonVariants()}
        >
          {label}
        </a>
      )}
    </div>
  );
}

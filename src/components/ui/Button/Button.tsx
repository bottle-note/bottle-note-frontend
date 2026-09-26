import type { ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-1 whitespace-nowrap box-border font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stroke-focus-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-stroke-neutral-subtle disabled:bg-bg-neutral-weak disabled:text-fg-disabled disabled:active:bg-bg-neutral-weak aria-disabled:pointer-events-none aria-disabled:border-stroke-neutral-subtle aria-disabled:bg-bg-neutral-weak aria-disabled:text-fg-disabled',
  {
    variants: {
      size: {
        sm: 'h-7 rounded-md px-3 text-[13px] leading-[17px]',
        md: 'h-10 rounded-lg px-4 text-[15px] leading-[19px]',
        lg: 'h-[52px] rounded-xl px-4 text-[15px] leading-[19px]',
      },
      variant: {
        primary:
          'bg-bg-brand-solid text-palette-static-white active:bg-bg-brand-solid-pressed',
        secondary:
          'border border-stroke-brand-solid bg-bg-layer-default text-fg-brand active:bg-bg-layer-default-pressed',
        text: 'bg-transparent text-fg-neutral-muted active:bg-bg-layer-default-pressed',
      },
      fullWidth: { true: 'w-full', false: '' },
    },
    defaultVariants: { size: 'lg', variant: 'primary', fullWidth: true },
  },
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  btnName?: string;
}

export function Button({
  btnName,
  children,
  type = 'button',
  size = 'lg',
  variant = 'primary',
  fullWidth = size === 'lg',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ size, variant, fullWidth }), className)}
      {...props}
    >
      {children ?? btnName}
    </button>
  );
}

interface DualButtonProps {
  okayBtnName?: string;
  cancelBtnName?: string;
  onClickOkay: () => void;
  onClickCancel: () => void;
}

export function DualButton({
  okayBtnName = '예',
  cancelBtnName = '아니요',
  onClickOkay,
  onClickCancel,
}: DualButtonProps) {
  return (
    <div className="flex w-full gap-2">
      <Button
        btnName={cancelBtnName}
        onClick={onClickCancel}
        variant="secondary"
        className="min-w-0 flex-1"
      />
      <Button
        btnName={okayBtnName}
        onClick={onClickOkay}
        className="min-w-0 flex-1"
      />
    </div>
  );
}

export default Button;

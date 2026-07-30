import React from 'react';

interface ButtonProps {
  btnName: string;
  type?: 'button' | 'submit';
  onClick: () => void;
  btnStyles?: string;
  btnTextStyles?: string;
  disabled?: boolean;
}

export function Button({
  btnName,
  type = 'button',
  onClick,
  btnStyles = 'bg-bg-brand-solid active:bg-bg-brand-solid-pressed',
  btnTextStyles = 'font-bold text-15',
  disabled = false,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`flex justify-center items-center w-full h-[52px] rounded-xl transition-colors
        ${
          disabled
            ? 'bg-bg-disabled text-fg-disabled cursor-not-allowed'
            : `${btnStyles} text-fg-brand-contrast`
        }`}
      disabled={disabled}
    >
      <span className={btnTextStyles}>{btnName}</span>
    </button>
  );
}

interface DualButtonProps {
  okayBtnName?: string;
  cancelBtnName?: string;
  onClickOkay: () => void;
  onClickCancel: () => void;
  okayBtnStyles?: string;
  okayBtnTextStyles?: string;
  cancelBtnStyles?: string;
  cancelBtnTextStyles?: string;
}

export function DualButton({
  okayBtnName = '예',
  cancelBtnName = '아니요',
  onClickOkay,
  onClickCancel,
  okayBtnStyles,
  okayBtnTextStyles,
  cancelBtnStyles = 'border border-stroke-brand-solid bg-bg-layer-default active:bg-bg-layer-default-pressed',
  cancelBtnTextStyles = 'text-fg-brand font-bold text-base',
}: DualButtonProps) {
  return (
    <div className="flex w-full gap-2">
      <Button
        btnName={cancelBtnName}
        onClick={onClickCancel}
        btnStyles={cancelBtnStyles}
        btnTextStyles={cancelBtnTextStyles}
      />
      <Button
        btnName={okayBtnName}
        onClick={onClickOkay}
        btnStyles={okayBtnStyles}
        btnTextStyles={okayBtnTextStyles}
      />
    </div>
  );
}

export default Button;

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
  btnStyles = 'bg-subCoral',
  btnTextStyles = 'text-white font-bold text-15',
  disabled = false,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`flex justify-center items-center w-full h-[3.8rem] rounded-xl
        ${disabled ? 'bg-brightGray cursor-not-allowed' : btnStyles}`}
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
  cancelBtnStyles = 'border border-subCoral',
  cancelBtnTextStyles = 'text-subCoral font-bold text-base',
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

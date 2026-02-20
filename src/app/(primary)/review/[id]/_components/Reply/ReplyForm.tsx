'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { useFormContext, FieldValues, SubmitHandler } from 'react-hook-form';
import { useAuth } from '@/hooks/auth/useAuth';
import useModalStore from '@/store/modalStore';
import { useScrollState } from '@/hooks/useScrollState';

interface Props {
  textareaRef: React.MutableRefObject<HTMLTextAreaElement | null>;
  handleCreateReply: SubmitHandler<FieldValues>;
}

export default function ReplyForm({ textareaRef, handleCreateReply }: Props) {
  const { isLoggedIn } = useAuth();
  const { register, watch, handleSubmit, setValue } = useFormContext();
  const content = watch('content') ?? '';
  const mentionName = watch('replyToReplyUserName');
  const newTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { handleLoginModal } = useModalStore();
  const { isVisible } = useScrollState(100);

  const handleResizeHeight = () => {
    if (newTextareaRef.current) {
      newTextareaRef.current.style.height = 'auto';
      newTextareaRef.current.style.height = `${newTextareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    handleResizeHeight();
  }, [content]);

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const text = (e.target as HTMLTextAreaElement).value;
    setValue('content', text);
    handleResizeHeight();
  };

  const insertAtCaret = (text: string) => {
    const el = newTextareaRef.current;
    if (el) {
      el.focus();
      const { selectionStart, selectionEnd, value } = el;
      const newValue =
        value.slice(0, selectionStart) + text + value.slice(selectionEnd);
      const newCursorPosition = selectionStart + text.length;

      setValue('content', newValue);

      setTimeout(() => {
        el.selectionStart = newCursorPosition;
        el.selectionEnd = newCursorPosition;
      }, 0);
    }
  };

  useEffect(() => {
    if (mentionName) {
      const mention = `@${mentionName} `;
      insertAtCaret(mention);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mentionName]);

  const setRefs = useCallback(
    (element: HTMLTextAreaElement | null) => {
      register('content').ref(element);
      newTextareaRef.current = element;
      // eslint-disable-next-line no-param-reassign
      textareaRef.current = element;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [register],
  );

  const handleLoginOrAction = (
    action: () => void,
    e?: React.MouseEvent<HTMLTextAreaElement | HTMLButtonElement>,
  ) => {
    if (!isLoggedIn) {
      e?.preventDefault();
      e?.stopPropagation();
      handleLoginModal();
    } else {
      action();
    }
  };

  const handleTextareaClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    handleLoginOrAction(() => {}, e);
  };

  const handleButtonClick = () => {
    handleLoginOrAction(() => handleSubmit(handleCreateReply)());
  };

  return (
    <div
      className="fixed-content w-full max-w-2xl px-4 z-10 transition-all duration-500 ease-out"
      style={{
        bottom: isVisible
          ? 'calc(var(--navbar-total-space) + 8px)'
          : 'calc(var(--safe-area-bottom, 32px) + 8px)',
      }}
    >
      <div className="bg-[#f6f6f6] py-2 px-3 rounded-lg shadow-md flex items-center">
        <div className="flex-grow flex items-center">
          <textarea
            placeholder={
              isLoggedIn
                ? '댓글을 입력해 주세요'
                : '로그인 후 댓글을 작성할 수 있어요:)'
            }
            className="flex-grow p-1 text-mainGray text-13 bg-[#f6f6f6] resize-none max-h-[50px] overflow-hidden focus:outline-none"
            onInput={handleInput}
            rows={1}
            ref={setRefs}
            readOnly={!isLoggedIn}
            value={content}
            maxLength={300}
            onClick={handleTextareaClick}
          />
        </div>
        <button
          className={`ml-2 px-4 py-1 ${content?.length !== 0 ? 'text-subCoral' : 'text-mainGray'}`}
          onClick={handleButtonClick}
        >
          등록
        </button>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useRef } from 'react';
import { useFormContext, FieldValues, SubmitHandler } from 'react-hook-form';
import { AuthService } from '@/lib/AuthService';
import useModalStore from '@/store/modalStore';

interface Props {
  textareaRef: React.MutableRefObject<HTMLTextAreaElement | null>;
  handleCreateReply: SubmitHandler<FieldValues>;
}

export default function ReplyInput({ textareaRef, handleCreateReply }: Props) {
  const { isLogin } = AuthService;
  const { register, watch, handleSubmit, setValue } = useFormContext();
  const content = watch('content');
  const mentionName = watch('replyToReplyUserName');
  const newTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { handleLoginModal } = useModalStore();

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
  };

  const insertAtCaret = (text: string) => {
    const el = textareaRef.current;
    if (el) {
      el.focus();
      const { selectionStart, selectionEnd, value } = el;
      el.value =
        value.slice(0, selectionStart) + text + value.slice(selectionEnd);
      el.selectionStart = selectionStart + text.length;
      el.selectionEnd = selectionStart + text.length;
      const updatedContent = el.value;
      setValue('content', updatedContent);
    }
  };

  const handleReplyToUser = (userName: string) => {
    const mention = `@${userName} `;
    insertAtCaret(mention);
  };

  useEffect(() => {
    const el = textareaRef.current;

    if (el) {
      const updatedHTML = content.replace(/@\w+/g, (match: any) => {
        // span은 적용이 되는데 style은 적용이 안됨, 추후 수정 필요
        return `<span style="color:blue">${match}</span>`;
      });
      el.innerHTML = updatedHTML;
    }
  }, [content]);

  useEffect(() => {
    if (mentionName) {
      handleReplyToUser(mentionName);
    }
  }, [mentionName]);

  // textareaRef를 newTextareaRef에 복사
  // 해당 부분 조금 문제가 있어서 다음 PR에서 수정할 예정
  useEffect(() => {
    newTextareaRef.current = textareaRef.current;
  }, [textareaRef]);

  const handleLoginOrAction = (
    action: () => void,
    e?: React.MouseEvent<HTMLTextAreaElement | HTMLButtonElement>,
  ) => {
    if (!isLogin) {
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
    <div className="fixed bottom-[6.7rem] left-0 right-0 mx-auto w-full max-w-2xl px-4 z-10">
      <div className="bg-[#f6f6f6] pt-1 px-3 rounded-lg shadow-md flex items-center">
        <div className="flex-grow flex items-center">
          <textarea
            placeholder={
              isLogin
                ? '댓글을 입력해 주세요'
                : '로그인 후 댓글을 작성할 수 있어요:)'
            }
            className="flex-grow p-1 text-mainGray text-13 bg-[#f6f6f6] resize-none max-h-[50px] overflow-hidden focus:outline-none"
            onInput={handleInput}
            rows={1}
            ref={(e) => {
              register('content').ref(e);
              newTextareaRef.current = e;
            }}
            readOnly={!isLogin}
            value={content}
            maxLength={300}
            onClick={handleTextareaClick}
          />
        </div>
        <button
          className={`ml-2 px-4 py-1 ${content.length !== 0 ? 'text-subCoral' : 'text-mainGray'}`}
          onClick={handleButtonClick}
        >
          등록
        </button>
      </div>
    </div>
  );
}

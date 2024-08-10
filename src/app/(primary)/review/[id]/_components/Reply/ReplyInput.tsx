'use client';

import React, { useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useFormContext, FieldValues, SubmitHandler } from 'react-hook-form';

interface Props {
  handleCreateReply: SubmitHandler<FieldValues>;
}

export default function ReplyInput({ handleCreateReply }: Props) {
  const { data: session } = useSession();
  const { register, watch, handleSubmit } = useFormContext();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const content = watch('content');

  const handleResizeHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    handleResizeHeight();
  }, [content]);

  return (
    <div className="fixed bottom-[5.5rem] left-0 right-0 mx-auto w-full max-w-2xl px-4 z-10">
      <div className="bg-[#f6f6f6] pt-1 px-3 rounded-lg shadow-md flex items-center">
        <div
          className={`flex-grow flex ${watch('replyToReplyUserName') ? 'flex-col' : 'items-center'}`}
        >
          {watch('replyToReplyUserName') && (
            <p className="px-1 text-13 text-mainCoral">
              @{watch('replyToReplyUserName')}
            </p>
          )}
          <textarea
            placeholder={
              session?.user
                ? '댓글을 입력해 주세요'
                : '로그인 후 댓글을 작성할 수 있어요:)'
            }
            className="flex-grow p-1 text-mainGray text-13 bg-[#f6f6f6] resize-none max-h-[50px] overflow-hidden focus:outline-none"
            disabled={!session?.user}
            onInput={handleResizeHeight}
            rows={1}
            {...register('content')}
            ref={(e) => {
              register('content').ref(e);
              textareaRef.current = e;
            }}
            value={content}
            maxLength={300}
          />
        </div>
        <button
          className={`ml-2 px-4 py-1 ${content.length !== 0 ? 'text-subCoral' : 'text-mainGray'}`}
          disabled={!session?.user}
          onClick={handleSubmit(handleCreateReply)}
        >
          등록
        </button>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useRef } from 'react';

export default function ReplyInput() {
  const [comment, setComment] = useState('');
  const textarea = useRef<HTMLTextAreaElement>(null);

  const handleResizeHeight = () => {
    if (textarea.current) {
      textarea.current.style.height = 'auto';
      textarea.current.style.height = `${textarea.current.scrollHeight}px`;
    }
  };

  return (
    <div className="fixed bottom-[5.5rem] left-0 right-0 mx-auto w-full max-w-2xl px-4 z-10">
      <div className="flex items-center bg-[#f6f6f6] py-2 px-4 rounded-xl shadow-md">
        <textarea
          ref={textarea}
          placeholder="댓글을 입력해 주세요"
          className="flex-grow p-2 text-mainGray text-13 bg-[#f6f6f6] resize-none max-h-[50px] overflow-hidden focus:outline-none"
          onInput={handleResizeHeight}
          rows={1}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button
          className={`ml-2 px-4 py-2 ${comment.length !== 0 ? 'text-subCoral' : 'text-mainGray'}`}
        >
          등록
        </button>
      </div>
    </div>
  );
}

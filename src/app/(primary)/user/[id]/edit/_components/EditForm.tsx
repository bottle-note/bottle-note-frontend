import Image from 'next/image';
import CloseIconGray from 'public/icon/close-brightgray.svg';
import { useState } from 'react';

function EditForm() {
  const [nickName, setNickName] = useState('');

  const handleResetNickName = () => {
    setNickName('');
  };

  const handelRegisterNickName = () => {
    // TODO: api 연동
    alert(nickName);
  };

  return (
    <form>
      <article className="flex flex-col relative">
        <label className="text-13 text-mainDarkGray">닉네임</label>
        <input
          placeholder="닉네임 입력"
          className="border-b border-mainGray py-2 text-15 placeholder:text-[#BFBFBF]"
          value={nickName}
          onChange={(e) => setNickName(e.target.value)}
          type="text"
          maxLength={19}
        />

        <div className="flex  gap-2 absolute bottom-2 right-0">
          <Image
            src={CloseIconGray}
            alt="닉네임 리셋"
            onClick={handleResetNickName}
          />
          <button
            className="label-selected text-10 py-1 px-2 disabled:label-disabled"
            onClick={handelRegisterNickName}
            disabled={!nickName}
          >
            변경
          </button>
        </div>
      </article>
      <div className="text-right clear-start text-mainGray text-10">{`${nickName.length}/20`}</div>

      <div>
        <article>생년월일 입력</article>
      </div>

      <div>
        <article>성별 토글</article>
      </div>
    </form>
  );
}

export default EditForm;

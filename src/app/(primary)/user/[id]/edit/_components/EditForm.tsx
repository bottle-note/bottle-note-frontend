/* eslint-disable jsx-a11y/label-has-associated-control */
import { useState } from 'react';
import Image from 'next/image';
// import { filterNumbers } from '@/utils/filterNumbers';
import { UserApi } from '@/app/api/UserApi';
import { validate } from '@/utils/validate';
import Modal from '@/components/Modal';
import useModalStore from '@/store/modalStore';
import CloseIconGray from 'public/icon/close-brightgray.svg';

function EditForm() {
  const [nickName, setNickName] = useState('');
  const { handleModalState, state } = useModalStore();
  // const [birthDate, setBirthDate] = useState('');
  // const [gender, setGender] = useState<'MALE' | 'FEMALE' | null>(null);

  const handleResetNickName = () => {
    setNickName('');
  };

  const validateNickName = (subject: string) => {
    const isValidLength = validate.length({ value: subject, min: 2, max: 11 });
    if (!isValidLength) {
      return isValidLength;
    }

    const isValidValue = validate.isKoreanAlphaNumeric(subject);

    if (!isValidValue) {
      return isValidValue;
    }

    const hasSpace = validate.hasSpace(subject);
    if (hasSpace) {
      return hasSpace;
    }

    return true;
  };

  const handelRegisterNickName = async (newNickName: string) => {
    if (!validateNickName(newNickName)) {
      return handleModalState({
        isShowModal: true,
        mainText: `닉네임은 2 ~ 11자의\n한글, 영문, 숫자만 가능합니다.`,
      });
    }

    try {
      await UserApi.changeNickname(newNickName);

      return handleModalState({
        isShowModal: true,
        mainText: `저장되었습니다.`,
      });
    } catch (e) {
      // TODO: 에러 상태 코드에 따른 메시지 분기처리
      // const error = e as ApiResponse<unknown>;

      return handleModalState({
        isShowModal: true,
        mainText: `변경 및 저장에 실패했습니다..`,
      });
    }
  };

  // const handleGender = (selectedGender: 'MALE' | 'FEMALE') => {
  //   console.log(gender);
  //   if (gender) return setGender(null);

  //   return setGender(selectedGender);
  // };

  return (
    <>
      <div className="flex flex-col gap-8">
        <div>
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
                className="label-selected text-10 disabled:label-disabled"
                onClick={() => handelRegisterNickName(nickName)}
                disabled={!nickName}
              >
                변경
              </button>
            </div>
          </article>
          <div className="text-right clear-start text-mainGray text-10 mt-1">{`${nickName.length}/20`}</div>
        </div>

        {/* NOTE: 본인인증, 성별 관련하여 변동 가능성 있어 주석처리 */}
        {/* <div>
        <article className="flex flex-col relative">
          <label className="text-13 text-mainDarkGray">생년월일</label>
          <div className="flex border-b border-mainGray">
            <input
              className="py-2 text-15 placeholder:text-[#BFBFBF] w-2/5"
              onChange={(e) => setBirthDate(filterNumbers(e.target.value))}
              type="numeric"
              maxLength={6}
              value={birthDate}
            />
            <div className="text-[#BFBFBF] px-2"> - </div>
            <input
              className="py-2 text-15 placeholder:text-[#BFBFBF] disabled:bg-white w-3/5"
              type="text"
              disabled
            />
          </div>

          <div className="flex  gap-2 absolute bottom-2 right-0">
            <button
              className="label-default text-10 disabled:label-disabled"
              onClick={handelRegisterNickName}
              disabled
            >
              본인인증
            </button>
          </div>
        </article>
      </div> */}

        {/* <div>
        <article className="flex flex-col relative">
          <label className="text-13 text-mainDarkGray">
            성별
            <span className="text-[#BFBFBF]">(선택)</span>
          </label>
          <div className="flex border-b border-mainGray gap-1 py-2">
            <button
              className={`${gender === 'MALE' ? 'label-selected' : 'label-default'} text-xs`}
              onClick={() => handleGender('MALE')}
            >
              남성
            </button>
            <button
              className={`${gender === 'FEMALE' ? 'label-selected' : 'label-default'} text-xs`}
              onClick={() => handleGender('FEMALE')}
            >
              여성
            </button>
          </div>
        </article>
      </div> */}
      </div>
      <Modal mainText={state.mainText} subText={state.subText} />
    </>
  );
}

export default EditForm;

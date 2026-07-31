/* eslint-disable jsx-a11y/label-has-associated-control */
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { UserApi } from '@/api/user/user.api';
import { validate } from '@/utils/validate';
import useModalStore from '@/store/modalStore';
import { ApiResponse } from '@/api/_shared/types';
import CloseIconGray from 'public/icon/close-brightgray.svg';

interface Props {
  userId: string;
}

function EditForm({ userId }: Props) {
  const router = useRouter();
  const [nickName, setNickName] = useState('');
  const { handleModalState, handleCloseModal } = useModalStore();

  useEffect(() => {
    (async () => {
      if (userId) {
        const res = await UserApi.getUserInfo({ userId });
        setNickName(res.data.nickName ?? '');
      }
    })();
  }, [userId]);

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
      const result = await UserApi.changeNickname(newNickName);

      if (result.code === 200) {
        return handleModalState({
          isShowModal: true,
          mainText: `저장되었습니다.`,
          subText: '',
          handleConfirm: () => {
            handleCloseModal();
            router.back();
          },
        });
      }
    } catch (e) {
      const errorRes = e as ApiResponse<any>;
      if (errorRes.errors[0].code === 'USER_NICKNAME_NOT_VALID') {
        return handleModalState({
          isShowModal: true,
          mainText: `이미 사용중인 닉네임입니다.👀`,
          subText: `다른 닉네임으로 변경해주세요.`,
        });
      }

      return handleModalState({
        isShowModal: true,
        mainText: `변경 및 저장에 실패했습니다..`,
      });
    }
  };

  return (
    <>
      <div className="flex flex-col gap-8">
        <div>
          <article className="flex flex-col relative">
            <label className="text-13 text-fg-neutral">닉네임</label>
            <input
              placeholder="닉네임 입력"
              className="border-b border-stroke-neutral-subtle py-2 text-15 placeholder:text-fg-placeholder bg-transparent outline-none appearance-none rounded-none"
              value={nickName}
              onChange={(e) => setNickName(e.target.value)}
              type="text"
              maxLength={19}
            />

            <div className="flex  gap-2 absolute bottom-2 right-0">
              {nickName.length ? (
                <Image
                  src={CloseIconGray}
                  alt="닉네임 리셋"
                  onClick={handleResetNickName}
                />
              ) : (
                <></>
              )}
              <button
                className="label-selected text-12 font-normal disabled:label-disabled"
                onClick={() => handelRegisterNickName(nickName)}
                disabled={!nickName}
              >
                변경
              </button>
            </div>
          </article>
          <div className="text-right clear-start text-fg-neutral-muted text-10 mt-1">{`${nickName.length}/20`}</div>
        </div>
      </div>
    </>
  );
}

export default EditForm;

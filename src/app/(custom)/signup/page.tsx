'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { SubHeader } from '@/app/(primary)/_components/SubHeader';
import useModalStore from '@/store/modalStore';
import Modal from '@/components/Modal';
import { AuthApi } from '@/app/api/AuthApi';
import { AuthService } from '@/lib/AuthService';
import { UserData } from '@/types/Auth';
import { ROUTES } from '@/constants/routes';

const jwt = require('jsonwebtoken');

const GENDER_OPTIONS = ['남', '여', '선택안함'] as const;

type SignupFormValues = {
  email: string;
  password: string;
  age: number;
  gender: (typeof GENDER_OPTIONS)[number];
  termsCheck: boolean;
};

export default function Signup() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors: loginErrors },
    watch,
  } = useForm<SignupFormValues>({
    defaultValues: {
      gender: '선택안함',
    },
  });
  const { handleModalState, handleCloseModal } = useModalStore();
  const { login } = AuthService;

  const fieldValues = Object.values(watch());
  const isFormFilled = fieldValues.every((fieldValue) => Boolean(fieldValue));

  const mapGenderToApiFormat = (gender: (typeof GENDER_OPTIONS)[number]) => {
    if (gender === '선택안함') return null;
    if (gender === '남') return 'MALE';
    if (gender === '여') return 'FEMALE';

    return null;
  };

  const onSubmit = async ({
    email,
    password,
    age,
    gender,
  }: SignupFormValues) => {
    try {
      const result = await AuthApi.client.basicSignup({
        email,
        password,
        age,
        gender: mapGenderToApiFormat(gender),
      });

      const decoded: UserData = jwt.decode(result.accessToken);

      login(decoded, {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });

      handleModalState({
        isShowModal: true,
        mainText: '보틀노트에 오신걸 환영합니다.',
        handleConfirm: () => {
          handleCloseModal();
          router.push(ROUTES.LOGIN);
        },
      });
    } catch (e) {
      handleModalState({
        isShowModal: true,
        mainText: `${(e as unknown as Error).message}`,
        handleConfirm: () => {
          handleCloseModal();
        },
      });
    }
  };

  return (
    <>
      <main className="bg-white flex flex-col h-full flex-grow pb-16">
        <SubHeader>
          <SubHeader.Left
            onClick={() => {
              router.back();
            }}
          >
            <Image
              src="/icon/arrow-left-subcoral.svg"
              alt="arrowIcon"
              width={23}
              height={23}
            />
          </SubHeader.Left>
          <SubHeader.Center>회원가입</SubHeader.Center>
        </SubHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-2 h-full flex-grow pt-5 px-5"
        >
          <div className="flex flex-col gap-2">
            <input
              className="border border-subCoral p-2 rounded-md"
              type="email"
              placeholder="이메일 입력"
              {...register('email', { required: '이메일을 입력하세요' })}
            />
            <span
              className={`text-xs text-mainGray ${loginErrors.email && 'text-red-500'}`}
            >
              {loginErrors.email
                ? loginErrors.email.message
                : '사용하시는 이메일을 입력해주세요.'}
            </span>

            <input
              className="border border-subCoral p-2 rounded-md"
              type="password"
              placeholder="비밀번호 입력"
              {...register('password', {
                required: '비밀번호를 입력하세요',
                minLength: { value: 8, message: '8자 이상 입력하세요' },
                maxLength: { value: 35, message: '35자 이하로 입력하세요' },
              })}
            />

            <span
              className={`text-xs text-mainGray ${loginErrors.password && 'text-red-500'}`}
            >
              {loginErrors.password
                ? loginErrors.password.message
                : '최소 8자 이상 최대 35자 이하로 입력해주세요.'}
            </span>

            <input
              className="border border-subCoral p-2 rounded-md"
              type="number"
              placeholder="만나이 입력"
              {...register('age', {
                required: '나이를 입력하세요.',
                valueAsNumber: true,
                validate: (value) =>
                  value >= 19 || '19세 이상만 가입 가능합니다.',
              })}
            />

            <span
              className={`text-xs text-mainGray ${loginErrors.age && 'text-red-500'}`}
            >
              {loginErrors.age
                ? loginErrors.age.message
                : '19세 이하는 가입할 수 없습니다.'}
            </span>

            <div className="flex items-center space-x-3 py-3">
              {GENDER_OPTIONS.map((option) => (
                <label
                  key={option}
                  htmlFor={option}
                  className="flex items-center text-mainDarkGray text-10"
                >
                  <input
                    type="radio"
                    className="mr-1"
                    id={option}
                    value={option}
                    {...register('gender')}
                    checked={watch('gender') === option}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          <div className="text-xs flex items-center gap-2">
            <input
              type="checkbox"
              {...register('termsCheck')}
              checked={watch('termsCheck')}
            />
            <div className="whitespace-pre">
              <a
                className="text-subCoral font-bold"
                href="https://bottle-note.notion.site/127395d49d9580c8813ec167638892be?pvs=4"
                target="_blank"
              >
                이용약관
              </a>
              <span> 및 </span>
              <a
                className="text-subCoral font-bold"
                href="https://bottle-note.notion.site/"
                target="_blank"
              >
                개인정보 처리방침
              </a>
              <span>에 동의합니다.</span>
            </div>
          </div>

          <button
            className={` rounded-md py-2.5 mt-auto ${isFormFilled ? 'bg-subCoral text-white' : 'bg-bgGray text-mainGray'}`}
          >
            회원가입
          </button>
        </form>
      </main>
      <Modal />
    </>
  );
}

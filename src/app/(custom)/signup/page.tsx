'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { SubHeader } from '@/app/(primary)/_components/SubHeader';

const GENDER_OPTIONS = ['남', '여', '선택안함'];

type SignupFormValues = {
  email: string;
  password: string;
  age: number;
  gender: (typeof GENDER_OPTIONS)[number];
};

export default function Signup() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors: loginErrors },
    watch,
  } = useForm<SignupFormValues>();

  const onSubmit = () => {};

  return (
    <main className="bg-white flex flex-col h-full flex-grow pb-16">
      <SubHeader bgColor="bg-bgGray">
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
        <SubHeader.Center textColor="text-subCoral">회원가입</SubHeader.Center>
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
          <span className="text-xs text-mainGray">
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

          <span className="text-xs text-mainGray">
            {loginErrors.password
              ? loginErrors.password.message
              : '최소 8자 이상 최대 35자 이하로 입력해주세요.'}
          </span>

          <input
            className="border border-subCoral p-2 rounded-md"
            type="number"
            placeholder="만나이 입력"
            {...register('age', { required: '나이를 입력하세요.' })}
          />

          <span className="text-xs text-mainGray">
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
          <input type="checkbox" />
          <div className="whitespace-pre">
            <span>이용약관</span>
            <span> 및 </span>
            <span>개인정보 처리방침</span>
            <span>에 동의합니다.</span>
          </div>
        </div>

        <button className="bg-bgGray text-mainGray rounded-md py-2.5 mt-auto">
          회원가입
        </button>
      </form>
    </main>
  );
}

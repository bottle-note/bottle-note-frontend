'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import * as yup from 'yup';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ReportApi } from '@/app/api/ReportApi';
import { SubHeader } from '@/app/(primary)/_components/SubHeader';
import { Button } from '@/components/Button';
import { FormValues } from '@/types/Inquire';
import useModalStore from '@/store/modalStore';
import Modal from '@/components/Modal';
import OptionSelect from '@/components/List/OptionSelect';
import ImagesForm from '../../review/_components/ImagesForm';

const TYPE_OPTIONS = [
  {
    type: 'WHISKEY',
    name: '위스키 관련 문의',
  },
  {
    type: 'REVIEW',
    name: '리뷰 관련 문의',
  },
  {
    type: 'USER',
    name: '회원 관련 문의',
  },
  {
    type: 'ETC',
    name: '그 외 기타 문의',
  },
];

export default function InquireRegister() {
  const router = useRouter();
  const { state, handleModalState } = useModalStore();

  const schema = yup.object({
    content: yup
      .string()
      .min(10, '최소 10글자 이상 입력이 필요합니다.')
      .required('내용을 작성해주세요.'),
    type: yup.string().required('문의사항을 선택해주세요.'),
  });

  const formMethods = useForm<FormValues>({
    mode: 'onChange',
    resolver: yupResolver(schema),
  });

  const {
    handleSubmit,
    reset,
    watch,
    register,
    setValue,
    formState: { errors },
  } = formMethods;

  const onSave = async (data: any) => {
    // console.log('save', data);

    try {
      const result = await ReportApi.registerUserReport(data);

      if (result) {
        handleModalState({
          isShowModal: true,
          type: 'ALERT',
          mainText: '성공적으로 문의되었습니다.',
          handleConfirm: () => {
            handleModalState({
              isShowModal: false,
              mainText: '',
            });
            reset();
            router.back();
          },
        });
      }
    } catch (error) {
      console.error('Failed to post report:', error);
    }
  };

  useEffect(() => {
    reset({
      content: '',
      type: '',
    });
  }, []);

  useEffect(() => {
    if (errors.content?.message || errors.type?.message) {
      handleModalState({
        isShowModal: true,
        mainText: errors.content?.message || errors.type?.message,
        type: 'ALERT',
      });
    }
  }, [errors]);

  return (
    <>
      <FormProvider {...formMethods}>
        <section className="pb-8 relative">
          <SubHeader bgColor="bg-bgGray">
            <SubHeader.Left
              onClick={() => {
                if (watch('content')?.length > 0) {
                  handleModalState({
                    isShowModal: true,
                    confirmBtnName: '예',
                    cancelBtnName: '아니요',
                    mainText: '작성 중인 내용이 있습니다. 정말 나가시겠습니까?',
                    type: 'CONFIRM',
                    handleConfirm: () => {
                      handleModalState({
                        isShowModal: false,
                        mainText: '',
                      });
                      reset();
                      router.back();
                    },
                  });
                } else router.back();
              }}
            >
              <Image
                src="/icon/arrow-left-subcoral.svg"
                alt="arrowIcon"
                width={23}
                height={23}
              />
            </SubHeader.Left>
            <SubHeader.Center textColor="text-subCoral">
              문의글 작성
            </SubHeader.Center>
          </SubHeader>
          <article className="m-5">
            <OptionSelect
              options={TYPE_OPTIONS}
              title="문의하기"
              defaultLabel="어떤 문의사항인가요?"
              handleOptionCallback={(value) => {
                setValue('type', value);
              }}
            />
          </article>
          <article className="m-5 border-t-[0.01rem] border-b-[0.01rem] border-mainGray">
            <textarea
              placeholder="문의 내용을 작성해주세요. (최소 10자)"
              className="w-full h-56 bg-white p-4 text-10 outline-none resize-none text-mainGray"
              minLength={10}
              maxLength={1000}
              {...register('content')}
            />
            <div className="text-right text-mainGray text-10 pb-2">
              ({watch('content')?.length} / 1000)
            </div>
          </article>
          <article className="m-5 pb-5 border-b-[0.01rem] border-mainGray">
            <ImagesForm />
          </article>
          <article className="mx-5 space-y-9">
            <Button onClick={handleSubmit(onSave)} btnName="전송" />
          </article>
        </section>
        {state.isShowModal && <Modal />}
      </FormProvider>
    </>
  );
}

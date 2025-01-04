'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ReportApi } from '@/app/api/ReportApi';
import { SubHeader } from '@/app/(primary)/_components/SubHeader';
import { Button } from '@/components/Button';
import { FormValues } from '@/types/Report';
import { useSingleApiCall } from '@/hooks/useSingleApiCall';
import { useErrorModal } from '@/hooks/useErrorModal';
import useModalStore from '@/store/modalStore';
import Modal from '@/components/Modal';
import OptionSelect from '@/components/List/OptionSelect';
import Loading from '@/components/Loading';
import { REPORT_TYPE } from '@/app/(primary)/report/_constants/index';

export default function Report() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, handleModalState } = useModalStore();
  const { isProcessing, executeApiCall } = useSingleApiCall();

  const type = searchParams.get('type');
  const reportUserId = searchParams.get('userId');
  const reportTitle = REPORT_TYPE[type as 'review' | 'comment' | 'user'].title;

  const schema = yup.object({
    content: yup
      .string()
      .min(10, '최소 10글자 이상 입력이 필요합니다.')
      .required('내용을 작성해주세요.'),
    type: yup.string().required('신고사항을 선택해주세요.'),
  });

  const userSchema = schema.shape({
    reportUserId: yup.number().required(),
  });

  const {
    handleSubmit,
    reset,
    watch,
    register,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    mode: 'onChange',
    resolver: yupResolver(type === 'user' ? userSchema : schema), // comment, review는 API 나오면 맞춰서 수정 예정
  });

  // data type은 추후 report API 나오면 맞춰서 수정 예정
  const onSave = async (data: any) => {
    // console.log('save', data);

    // data type은 추후 report API 나오면 맞춰서 함수로 나누기
    const submitReport = async () => {
      try {
        let result;
        if (type === 'user') {
          result = await ReportApi.registerUserReport(data);
        }

        if (result) {
          handleModalState({
            isShowModal: true,
            type: 'ALERT',
            mainText: '성공적으로 신고되었습니다.',
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

    await executeApiCall(submitReport);
  };

  const { showErrorModal } = useErrorModal<FormValues>(errors);

  useEffect(() => {
    showErrorModal(['content', 'type']);
  }, [errors]);

  useEffect(() => {
    reset({
      content: '',
      type: '',
    });
  }, []);

  useEffect(() => {
    if (reportUserId) {
      setValue('reportUserId', Number(reportUserId));
    }
  }, [reportUserId]);

  return (
    <>
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
            {reportTitle}
          </SubHeader.Center>
        </SubHeader>
        <article className="m-5">
          <OptionSelect
            options={REPORT_TYPE[type as 'review' | 'comment' | 'user'].options}
            title="신고하기"
            defaultLabel="어떤 신고사항인가요?"
            handleOptionCallback={(value) => {
              setValue('type', value);
            }}
          />
        </article>
        <article className="m-5 border-t-[0.01rem] border-b-[0.01rem] border-mainGray">
          <textarea
            placeholder={`${reportTitle} 사유를 작성해주세요.(최소 10자)`}
            className="w-full h-56 bg-white p-4 text-10 outline-none resize-none text-mainGray"
            minLength={10}
            maxLength={1000}
            {...register('content')}
          />
          <div className="text-right text-mainGray text-10 pb-2">
            ({watch('content')?.length} / 1000)
          </div>
        </article>
        <article className="mx-5 space-y-9">
          <Button
            onClick={handleSubmit(onSave)}
            btnName="전송"
            disabled={isProcessing}
          />
        </article>
      </section>
      {isProcessing && <Loading />}
      {state.isShowModal && <Modal />}
    </>
  );
}

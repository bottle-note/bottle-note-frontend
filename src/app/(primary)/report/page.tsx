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
import { FormValues, ReportTypeMap } from '@/types/Report';
import { useSingleApiCall } from '@/hooks/useSingleApiCall';
import { useErrorModal } from '@/hooks/useErrorModal';
import useModalStore from '@/store/modalStore';
import OptionSelect from '@/components/List/OptionSelect';
import Loading from '@/components/Loading';
import { REPORT_TYPE } from '@/app/(primary)/report/_constants/index';

type ReportType = 'review' | 'comment' | 'user';

const createBaseSchema = () =>
  yup.object({
    content: yup
      .string()
      .min(10, '최소 10글자 이상 입력이 필요합니다.')
      .required('내용을 작성해주세요.'),
    type: yup.string().required('신고사항을 선택해주세요.'),
  });

const getSchemaByType = (reportType: ReportType) => {
  const baseSchema = createBaseSchema();

  switch (reportType) {
    case 'user':
      return baseSchema.shape({
        reportUserId: yup.number().required(),
      });
    case 'review':
      return baseSchema.shape({
        reportReviewId: yup.number().required(),
      });
    default:
      return baseSchema;
  }
};

export default function Report() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleModalState } = useModalStore();
  const { isProcessing, executeApiCall } = useSingleApiCall();

  const type = searchParams.get('type') as ReportType;
  const reportUserId = searchParams.get('userId');
  const reportReviewId = searchParams.get('reviewId');
  const reportTitle = REPORT_TYPE[type].title;

  const {
    handleSubmit,
    reset,
    watch,
    register,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    mode: 'onChange',
    resolver: yupResolver(
      getSchemaByType(type as 'review' | 'comment' | 'user'),
    ),
    defaultValues: {
      content: '',
      type: '',
    },
  });

  const onSave = async (data: FormValues) => {
    const submitReport = async () => {
      try {
        if (!type) return;

        await ReportApi.registerReport(
          type,
          data as ReportTypeMap[typeof type]['params'],
        );

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
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'errors' in error) {
          const apiError = error as { errors: Array<{ message: string }> };
          if (apiError.errors?.length > 0) {
            handleModalState({
              isShowModal: true,
              type: 'ALERT',
              mainText: apiError.errors[0].message,
              handleConfirm: () => {
                handleModalState({
                  isShowModal: false,
                  mainText: '',
                });
              },
            });
          }
        }
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
    if (reportUserId) {
      setValue('reportUserId', Number(reportUserId));
    }
  }, [reportUserId]);

  useEffect(() => {
    if (reportReviewId) {
      setValue('reportReviewId', Number(reportReviewId));
    }
  }, [reportReviewId]);

  return (
    <>
      <section className="pb-8 relative">
        <SubHeader>
          <SubHeader.Left
            onClick={() => {
              if (watch('content')?.length > 0) {
                handleModalState({
                  isShowModal: true,
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
          <SubHeader.Center>{reportTitle}</SubHeader.Center>
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
    </>
  );
}

'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import * as yup from 'yup';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { InquireApi } from '@/app/api/InquireApi';
import { SubHeader } from '@/app/(primary)/_components/SubHeader';
import { Button } from '@/components/Button';
import { uploadImages } from '@/utils/S3Upload';
import { FormValues } from '@/types/Inquire';
import useModalStore from '@/store/modalStore';
import { useSingleApiCall } from '@/hooks/useSingleApiCall';
import Modal from '@/components/Modal';
import { useErrorModal } from '@/hooks/useErrorModal';
import Loading from '@/components/Loading';
import ImageUploader from '@/app/(primary)/_components/ImageUploader';
import { INQUIRE_TYPE } from '@/constants/Inquire';
import InquireForm from './_components/InquireForm';
import InquireTypeSelector from './_components/InquireTypeSelector';

export default function InquireRegister() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramsType =
    (searchParams.get('type') as keyof typeof INQUIRE_TYPE) || 'service';
  const serviceType = INQUIRE_TYPE[paramsType] || paramsType;
  const { state, handleModalState } = useModalStore();
  const { isProcessing, executeApiCall } = useSingleApiCall();

  const createSchema = () => {
    const baseSchema = {
      title: yup
        .string()
        .min(5, '문의 제목은 최소 5글자 이상 입력이 필요합니다.')
        .required('제목을 작성해주세요.'),
      content: yup
        .string()
        .min(10, '문의 내용은 최소 10글자 이상 입력이 필요합니다.')
        .required('내용을 작성해주세요.'),
    };

    if (paramsType === 'business') {
      return yup.object({
        ...baseSchema,
        businessSupportType: yup.string().required('문의사항을 선택해주세요.'),
      });
    } else {
      return yup.object({
        ...baseSchema,
        type: yup.string().required('문의사항을 선택해주세요.'),
      });
    }
  };

  const schema = createSchema();

  const formMethods = useForm<FormValues>({
    mode: 'onChange',
    resolver: yupResolver(schema as yup.ObjectSchema<FormValues>),
    defaultValues: {
      title: '',
      content: '',
      type: paramsType === 'service' ? '' : undefined,
      businessSupportType: paramsType === 'business' ? '' : undefined,
      images: null,
      imageUrlList: null,
    },
  });

  const {
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = formMethods;

  const onSave = async (data: FormValues) => {
    const processSubmission = async () => {
      let uploadedImageUrls = null;
      if (data.images?.length !== 0) {
        const images = data?.images?.map((file: any) => file.image);
        if (images) {
          try {
            uploadedImageUrls = await uploadImages('inquire', images);
          } catch (error) {
            console.error('S3 업로드 에러:', error);
            throw error;
          }
        }
      }

      const params: any = {
        title: data.title,
        content: data.content,
        imageUrlList: uploadedImageUrls ?? null,
      };

      if (paramsType === 'business') {
        params.businessSupportType = data.businessSupportType;
      } else {
        params.type = data.type;
      }

      const result =
        paramsType === 'business'
          ? await InquireApi.registerBusinessInquire(params)
          : await InquireApi.registerInquire(params);

      if (result) {
        handleModalState({
          isShowModal: true,
          type: 'ALERT',
          mainText: '성공적으로 문의가 접수되었습니다.',
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
    };

    await executeApiCall(processSubmission);
  };

  const { showErrorModal } = useErrorModal<FormValues>(errors);

  useEffect(() => {
    const fieldNames = ['title', 'content'];
    if (paramsType === 'business') {
      fieldNames.push('businessSupportType');
    } else {
      fieldNames.push('type');
    }
    showErrorModal(fieldNames as Array<keyof FormValues>);
  }, [errors, paramsType]);

  return (
    <>
      <FormProvider {...formMethods}>
        <section className="pb-8 relative">
          <SubHeader>
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
            <SubHeader.Center>{serviceType} 문의하기</SubHeader.Center>
          </SubHeader>
          <section className="mx-5 my-[30px] space-y-[30px]">
            <InquireForm />
            <InquireTypeSelector paramsType={paramsType} />

            <article className="space-y-[10px]">
              <label className="block text-12 mb-1 text-mainGray">
                <span className="font-bold">이미지 첨부 </span>
                <span className="font-light">(선택·최대 5장)</span>
              </label>

              <div className="mt-4">
                <ImageUploader useMarginLeft={false} />
              </div>
            </article>

            <Button onClick={handleSubmit(onSave)} btnName="문의 보내기" />
          </section>
        </section>
        {isProcessing && <Loading />}
        {state.isShowModal && <Modal />}
      </FormProvider>
    </>
  );
}

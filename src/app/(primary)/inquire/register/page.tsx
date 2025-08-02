'use client';

import React, { useEffect, useState } from 'react';
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
import Label from '@/app/(primary)/_components/Label';
import {
  INQUIRE_TYPE,
  SERVICE_TYPE_LIST,
  BUSINESS_TYPE_LIST,
} from '@/constants/Inquire';

// TODO: 탭 초기값 props 로 받아오도록 수정
export default function InquireRegister() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramsType =
    (searchParams.get('type') as keyof typeof INQUIRE_TYPE) || 'service';
  const serviceType = INQUIRE_TYPE[paramsType] || paramsType;
  const { state, handleModalState } = useModalStore();
  const { isProcessing, executeApiCall } = useSingleApiCall();
  const [showImageUploader, setShowImageUploader] = useState(false);

  const labelBaseStyle = 'border border-subCoral rounded-md text-15 px-3 py-2';

  const schema = yup.object({
    title: yup
      .string()
      .min(5, '최소 5글자 이상 입력이 필요합니다.')
      .required('제목을 작성해주세요.'),
    content: yup
      .string()
      .min(10, '최소 10글자 이상 입력이 필요합니다.')
      .required('내용을 작성해주세요.'),
    type: yup.string().required('문의사항을 선택해주세요.'),
  });

  const formMethods = useForm<FormValues>({
    mode: 'onChange',
    resolver: yupResolver(schema),
    defaultValues: {
      content: '',
      type: '',
      images: null,
      imageUrlList: null,
    },
  });

  const {
    handleSubmit,
    reset,
    watch,
    register,
    setValue,
    formState: { errors },
  } = formMethods;

  const onSave = async (data: FormValues) => {
    const processSubmission = async () => {
      let uploadedImageUrls = null;
      if (data.images?.length !== 0) {
        const images = data?.images?.map((file) => file.image);
        if (images) {
          try {
            uploadedImageUrls = await uploadImages('inquire', images);
          } catch (error) {
            console.error('S3 업로드 에러:', error);
            throw error;
          }
        }
      }

      const params = {
        title: data.title,
        content: data.content,
        type: data.type,
        imageUrlList: uploadedImageUrls ?? null,
      };

      const result = await InquireApi.registerInquire(params);

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
    showErrorModal(['title', 'content', 'type']);
  }, [errors]);

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
            <article className="space-y-[10px]">
              <label
                className="block font-bold text-mainGray text-13 mb-1"
                htmlFor="title"
              >
                문의 제목
              </label>
              <input
                id="title"
                type="text"
                placeholder=""
                className="w-full h-9 bg-sectionWhite rounded-none px-3 text-14 outline-none focus:border focus:border-subCoral"
                {...register('title')}
              />
            </article>
            <article className="space-y-[10px]">
              <label
                className="block text-12 mb-1 text-mainGray"
                htmlFor="content"
              >
                <span className="font-bold">문의 내용 </span>
                <span className="font-light">(자세한 내용을 적어주세요)</span>
              </label>
              <textarea
                id="content"
                placeholder="문의 내용을 작성해주세요. (최소 10자)"
                className="w-full h-56 bg-sectionWhite rounded-none px-3 py-3 text-14 outline-none focus:border focus:border-subCoral"
                minLength={10}
                maxLength={1000}
                {...register('content')}
              />
              <div className="text-right text-mainGray text-10">
                ({watch('content')?.length} / 1000)
              </div>
            </article>
            <article className="space-y-[10px]">
              <label
                className="block font-bold text-mainGray text-13 mb-1"
                htmlFor="type"
              >
                문의 유형
              </label>
              <div className="flex flex-wrap gap-2">
                {(paramsType === 'business'
                  ? BUSINESS_TYPE_LIST
                  : SERVICE_TYPE_LIST
                ).map((item) => (
                  <Label
                    key={item.name}
                    name={item.name}
                    isSelected={watch('type') === item.name}
                    onClick={() => setValue('type', item.name)}
                    selectedStyle={labelBaseStyle + ' bg-subCoral text-white'}
                    unselectedStyle={labelBaseStyle + ' bg-white text-subCoral'}
                  />
                ))}
              </div>
            </article>

            <article className="space-y-[10px]">
              <label className="block text-12 mb-1 text-mainGray">
                <span className="font-bold">이미지 첨부 </span>
                <span className="font-light">(선택·최대 5장)</span>
              </label>
              <button
                onClick={() => setShowImageUploader(!showImageUploader)}
                className="py-[10px] px-5 text-15 text-mainGray border border-brightGray bg-sectionWhite"
              >
                파일 첨부하기
              </button>

              {showImageUploader && (
                <div className="mt-4">
                  <ImageUploader useMarginLeft={false} />
                </div>
              )}
            </article>

            <article className="mx-5 space-y-9">
              <Button onClick={handleSubmit(onSave)} btnName="전송" />
            </article>
          </section>
        </section>
        {isProcessing && <Loading />}
        {state.isShowModal && <Modal />}
      </FormProvider>
    </>
  );
}

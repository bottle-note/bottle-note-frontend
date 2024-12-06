'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useFormContext } from 'react-hook-form';
import { SubHeader } from '@/app/(primary)/_components/SubHeader';
import { truncStr } from '@/utils/truncStr';
import PageModal from '@/components/PageModal';
import useModalStore from '@/store/modalStore';
import Modal from '@/components/Modal';
import SelectFlavor from './SelectFlavor';
import Label from '../../_components/Label';

interface Props {
  korName: string;
}

export default function TagsForm({ korName }: Props) {
  const { state, handleModalState } = useModalStore();
  const { setValue, watch } = useFormContext();
  const [tagModal, setTagModal] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  const watchTags = watch('flavor_tags');

  useEffect(() => {
    if (watchTags && watchTags.length !== 0) setTags(watchTags);
  }, [watchTags]);

  return (
    <>
      <article className={tags.length !== 0 ? 'space-y-2' : ''}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Image
              src="/icon/success-subcoral.svg"
              alt="placeIcon"
              width={24}
              height={24}
            />
            <p className="text-12 text-mainDarkGray font-bold">
              FLAVOR TAG 입력하기{' '}
              <span className="text-mainGray font-normal">(선택)</span>
            </p>
            <p className="text-10 text-mainDarkGray">
              {tags.length !== 0 && `총 ${tags.length}개 추가`}
            </p>
          </div>
          <div className="flex items-center">
            <p className="text-mainGray font-normal text-10">
              {tags.length !== 0 && '수정'}
            </p>
            <Image
              src="/icon/arrow-right-subcoral.svg"
              alt="rightIcon"
              width={18}
              height={18}
              onClick={() => {
                setTagModal(true);
              }}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {tags.map((tag: string) => (
            <React.Fragment key={tag}>
              <Label
                name={tag}
                styleClass="border-subCoral text-subCoral px-2 py-0.5 rounded-md text-13"
              />
            </React.Fragment>
          ))}
        </div>
      </article>
      {tagModal && (
        <PageModal>
          <SubHeader bgColor="bg-bgGray">
            <SubHeader.Left
              onClick={() => {
                if (isAdding) {
                  handleModalState({
                    isShowModal: true,
                    mainText:
                      '입력중인 테이스팅 태그가 있습니다.\n정말 나가시겠습니까?',
                    subText: '태그가 완성되지않으면 없어져요!',
                    type: 'CONFIRM',
                    confirmBtnName: '아니요',
                    cancelBtnName: '예',
                    handleCancel: () => {
                      handleModalState({
                        isShowModal: false,
                      });
                      setTagModal(false);
                      setValue('flavor_tags', tags);
                    },
                  });
                } else {
                  setTagModal(false);
                  setValue('flavor_tags', tags);
                }
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
              {korName && truncStr(korName, 14)}
            </SubHeader.Center>
          </SubHeader>
          <SelectFlavor
            tags={tags}
            setTags={setTags}
            setIsAdding={setIsAdding}
          />
        </PageModal>
      )}
      {state.isShowModal && <Modal />}
    </>
  );
}

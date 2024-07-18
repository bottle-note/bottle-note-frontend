'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Label from '../../_components/Label';
import { SubHeader } from '@/app/(primary)/_components/SubHeader';
import { truncStr } from '@/utils/truncStr';
import { useFormContext } from 'react-hook-form';
import Modal from '@/components/Modal';
import SelectFlavor from './SelectFlavor';

interface Props {
  korName: string;
}

export default function TagsForm({ korName }: Props) {
  const [tagModal, setTagModal] = useState(false);
  const [tags, setTags] = useState<string[]>([]);

  const { setValue, watch } = useFormContext();

  useEffect(() => {
    setTags(watch('flavor_tags'));
  }, [watch('flavor_tags')]);
  return (
    <>
      <article className={tags.length !== 0 ? 'space-y-2' : ''}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Image
              src="/icon/success-subcoral.svg"
              alt="placeIcon"
              width={20}
              height={20}
            />
            <p className="text-10 text-mainDarkGray font-bold">
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
            {/* <Link href="/review/register/flavorTag"> */}
            <Image
              src="/icon/arrow-right-subcoral.svg"
              alt="rightIcon"
              width={18}
              height={18}
              onClick={() => {
                setTagModal(true);
              }}
            />
            {/* </Link> */}
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {tags.map((tag: string) => (
            <React.Fragment key={tag}>
              <Label
                name={tag}
                style={
                  'border-subCoral text-subCoral px-2 py-0.5 rounded-md text-13'
                }
              />
            </React.Fragment>
          ))}
        </div>
      </article>
      {tagModal && (
        <Modal setModalOpen={setTagModal}>
          <SubHeader bgColor="bg-bgGray">
            <SubHeader.Left
              onClick={() => {
                setTagModal(false);
                setValue('flavor_tags', tags);
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
          <SelectFlavor tags={tags} setTags={setTags} />
        </Modal>
      )}
    </>
  );
}

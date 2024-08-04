'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { SubHeader } from '@/app/(primary)/_components/SubHeader';
import { ReviewApi } from '@/app/api/ReviewApi';
import EmptyView from '@/app/(primary)/_components/EmptyView';
import Reply from './_components/Reply';
import NavLayout from '@/app/(primary)/_components/NavLayout';
import Loading from '@/components/Loading';
import { shareOrCopy } from '@/utils/shareOrCopy';
import type {
  AlcoholInfo as AlcoholInfoType,
  ReviewDetailsWithoutAlcoholInfo,
} from '@/types/Review';
import useModalStore from '@/store/modalStore';
import Modal from '@/components/Modal';
import LoginModal from '@/app/(primary)/_components/LoginModal';
import { RootReply } from '@/types/Reply';
import ReplyInput from './_components/ReplyInput';
import ReviewDetails from './_components/ReviewDetails';
import AlcoholInfo from './_components/AlcoholInfoDisplay';

// comment 더미 데이터
const COMMENT_DATA: RootReply[] = [
  {
    userId: 0,
    imageUrl: 'https://picsum.photos/500',
    nickName: 'EKyCfReuzu',
    reviewReplyId: 0,
    reviewReplyContent:
      'GKyheCgkkBTCjGVCLPxNzRxcAHTFlBfJDrbeHqYBrqfJrqClTSiCQKkxxOKNAZCxntAIHYgSowapgmstaMDUMgRUCgKYwEOCduCESPkdRFWCiuxapKVNbSuEhJBXINzyNJulwgtRXKHZiUVSocVlxV',
    subReplyCount: 4,
    createAt: '2024-07-11T00:00:00',
  },
  {
    userId: 1,
    imageUrl: 'https://picsum.photos/500',
    nickName: 'exIEwrCesh',
    reviewReplyId: 1,
    reviewReplyContent:
      'doiJwoiUPRSeyWvSgGZwqWPyHiMGjrHKLmdLgMIhcUEbDXOKzOKtoMllfykmNRxSynPwkRTjcJCWLRHBQouMChQISXXfzydlmDYuSLDamdyBJGEOsimvIqOScyDsFpiRDhjhUDxZDXBWpOoDPFyALI',
    subReplyCount: 3,
    createAt: '2024-07-11T00:00:00',
  },
  {
    userId: 2,
    imageUrl: 'https://picsum.photos/500',
    nickName: 'wNisiHsnak',
    reviewReplyId: 2,
    reviewReplyContent:
      'jwmmSnAdvuwDGZLtWIqFryulMOioroOZnjiqMATUCsDeGswyjsEKYCBvqdbyhZOiMZklpDXJgLVHrITNsbgQaPpOlxAOKeIDMZbmzXnUzdwxLyKrnhpEBhRxeRaZzFiezSifTRvyPSoSCgtOnOclKf',
    subReplyCount: 2,
    createAt: '2024-07-11T00:00:00',
  },
  {
    userId: 3,
    imageUrl: 'https://picsum.photos/500',
    nickName: 'tDzVQRiVvY',
    reviewReplyId: 3,
    reviewReplyContent:
      'fAadQHQKjunqpdONROSqIVzEqvfonJRseBklUkQOJLtHRWgVOUdfCnkBjYFbNOrPQpvADPtBRGQwpAolkdbfTCRJbewQiohhGVNxhZjWBBmcYMSxIiosuRTpDSepBXzQWohJPgVsoICUGSLvRROJOf',
    subReplyCount: 4,
    createAt: '2024-07-11T00:00:00',
  },
  {
    userId: 4,
    imageUrl: 'https://picsum.photos/500',
    nickName: 'MPFndOCmyJ',
    reviewReplyId: 4,
    reviewReplyContent:
      'msSklSfIcnhLzPFMygIYXjsDwfUCIBnamJuPvIcoAQVatJWBKqYPVGFKktqJrdNfkTkQvqSDuRXIoEfCvjfzrViSeShacqeZMVdxNhclfkHwqTdOdrqJsoxlpJahCCxuEYVZTHjzckZbvCtYcOohKh',
    subReplyCount: 4,
    createAt: '2024-07-11T00:00:00',
  },
];

export default function ReviewDetail() {
  const router = useRouter();
  const { id: reviewId } = useParams();
  const { isShowModal, handleModal } = useModalStore();
  const [alcoholInfo, setAlcoholInfo] = useState<AlcoholInfoType | null>(null);
  const [reviewDetails, setReviewDetails] =
    useState<ReviewDetailsWithoutAlcoholInfo | null>(null);
  const [modalType, setModalType] = useState<'copy' | 'login' | null>(null);

  const handleLogin = () => {
    setModalType('login');
    handleModal();
  };

  const handleShare = () => {
    setModalType('copy');
    handleModal();
  };

  useEffect(() => {
    async function fetchReviewDetails() {
      // reviewId가 없을 때, 별도 페이지 처리가 필요한가?
      if (!reviewId) return;
      try {
        const result = await ReviewApi.getReviewDetails(reviewId);
        const { alcoholInfo: response, ...restData } = result;
        setAlcoholInfo(response);
        setReviewDetails(restData);
      } catch (error) {
        console.error('Failed to fetch review details:', error);
      }
    }

    fetchReviewDetails();
  }, [reviewId]);

  return (
    <>
      {alcoholInfo && reviewDetails ? (
        <>
          <NavLayout>
            <div className="relative pb-5">
              {alcoholInfo.imageUrl && (
                <div
                  className="absolute w-full h-full  bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${alcoholInfo.imageUrl})`,
                  }}
                />
              )}
              <div className="absolute w-full h-full bg-mainCoral bg-opacity-90" />
              <SubHeader bgColor="bg-mainCoral/10">
                <SubHeader.Left
                  onClick={() => {
                    router.back();
                  }}
                >
                  <Image
                    src="/icon/arrow-left-white.svg"
                    alt="arrowIcon"
                    width={23}
                    height={23}
                  />
                </SubHeader.Left>
                <SubHeader.Center textColor="text-white">
                  리뷰 상세보기
                </SubHeader.Center>
                <SubHeader.Right
                  onClick={() => {
                    setModalType('copy');
                    shareOrCopy(
                      `${process.env.NEXT_PUBLIC_BOTTLE_NOTE_URL}/review/${reviewId}`,
                      handleModal,
                      `${alcoholInfo.korName} 리뷰`,
                      `${alcoholInfo.korName} 리뷰 상세보기`,
                    );
                  }}
                >
                  <Image
                    src="/icon/externallink-outlined-white.svg"
                    alt="linkIcon"
                    width={23}
                    height={23}
                  />
                </SubHeader.Right>
              </SubHeader>
              {alcoholInfo && (
                <AlcoholInfo data={alcoholInfo} handleLogin={handleLogin} />
              )}
            </div>
            <ReviewDetails
              data={reviewDetails}
              handleShare={handleShare}
              handleLogin={handleLogin}
            />
            {/* 댓글 api 변경으로 댓글 구현 시 수정 예정 */}
            {COMMENT_DATA ? (
              <>
                <div className="h-4 bg-sectionWhite" />
                <section className="mx-5 py-5 space-y-4 pb-40">
                  {COMMENT_DATA.map((comment, index) => (
                    <React.Fragment key={comment.userId + index}>
                      <Reply data={comment}>
                        {comment.subReplyCount > 0 &&
                          COMMENT_DATA.map((subComment, subIndex) => (
                            <React.Fragment
                              key={comment.userId + subIndex + index}
                            >
                              <div className="border-b border-mainCoral/30" />
                              <div className="ml-5">
                                <Reply data={subComment} />
                              </div>
                            </React.Fragment>
                          ))}
                      </Reply>
                      {index !== COMMENT_DATA.length - 1 && (
                        <div className="border-b border-mainGray/30" />
                      )}
                    </React.Fragment>
                  ))}
                </section>
              </>
            ) : (
              <>
                <div className="h-4 bg-sectionWhite" />
                <section className="py-5">
                  <EmptyView text="아직 댓글이 없어요!" />
                </section>
              </>
            )}
            <ReplyInput />
          </NavLayout>
          {isShowModal && modalType === 'copy' && (
            <Modal
              mainText="해당 페이지 링크를 복사했습니다."
              subText="친구에게 공유하러 가볼까요?"
            />
          )}
          {isShowModal && modalType === 'login' && (
            <LoginModal handleClose={handleModal} />
          )}
        </>
      ) : (
        <Loading />
      )}
    </>
  );
}

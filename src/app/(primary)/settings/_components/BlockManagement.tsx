'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useModalStore from '@/store/modalStore';
import Modal from '@/components/Modal';
import { BlockApi } from '@/app/api/BlockApi';
interface BlockedUser {
  userId: string;
  nickName: string;
  blockedAt: string;
}

export default function BlockManagement() {
  const { handleModalState, handleCloseModal } = useModalStore();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlockList = async () => {
      try {
        const response = await BlockApi.getBlockList();
        if (response.data?.items) {
          setBlockedUsers(
            Array.isArray(response.data.items)
              ? response.data.items
              : [response.data.items],
          );
        }
      } catch (error) {
        console.error('차단 목록 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlockList();
  }, []);

  const itemVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        type: 'spring',
        stiffness: 100,
      },
    }),
  };

  const handleUnblockUser = (userId: string, nickname: string) => {
    handleModalState({
      isShowModal: true,
      type: 'CONFIRM',
      mainText: `${nickname}님을 차단 해제하시겠습니까?`,
      confirmBtnName: '해제',
      cancelBtnName: '취소',
      handleConfirm: async () => {
        try {
          // 실제 차단 해제 API 호출
          // await unblockUserAPI(userId);

          // 로컬 상태에서 해당 사용자 제거
          setBlockedUsers((prev) =>
            prev.filter((user) => user.userId !== userId),
          );

          console.log(`사용자 ${userId} 차단 해제 완료`);
          handleCloseModal();
        } catch (error) {
          console.error('차단 해제 실패:', error);
          handleCloseModal();
        }
      },
      handleCancel: handleCloseModal,
    });
  };

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Content */}
        <div className="px-6 pt-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-brightGray text-15">로딩중...</p>
            </div>
          ) : (
            <>
              {/* 차단 유저 수 */}
              <p className="text-15 font-medium text-mainBlack mb-6">
                차단 유저 {blockedUsers.length}명
              </p>

              {/* 차단 유저 목록 */}
              {blockedUsers.length > 0 ? (
                <div className="space-y-0">
                  {blockedUsers.map((user, index) => (
                    <motion.div
                      key={user.userId}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      custom={index}
                      className="py-4"
                    >
                      {/* 구분선 (첫 번째 아이템 제외) */}
                      {index > 0 && (
                        <div className="border-t border-brightGray -mt-4 mb-4" />
                      )}

                      {/* 유저 정보 */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {/* 프로필 이미지 */}
                          <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                            <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center">
                              {/* 기본 프로필 아이콘 또는 실제 이미지 */}
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                className="text-gray-500"
                              >
                                <path
                                  d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <circle
                                  cx="12"
                                  cy="7"
                                  r="4"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                            {/* 실제 이미지를 사용할 경우
                        <Image
                          src={user.profileImage}
                          alt={`${user.nickname} 프로필`}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        */}
                          </div>

                          {/* 닉네임 */}
                          <span className="text-15 font-medium text-mainBlack">
                            {user.nickName}
                          </span>
                        </div>

                        {/* 차단해제 버튼 */}
                        <button
                          onClick={() =>
                            handleUnblockUser(user.userId, user.nickName)
                          }
                          className="px-4 py-2 border border-subCoral text-subCoral rounded-lg text-14 font-medium hover:bg-subCoral hover:text-white transition-colors flex-shrink-0"
                        >
                          차단해제
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                /* 차단된 유저가 없을 때 */
                <div className="text-center py-12">
                  <p className="text-brightGray text-15">
                    차단된 사용자가 없습니다.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Modal />
    </>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useModalStore from '@/store/modalStore';
import Modal from '@/components/Modal';
import { BlockApi } from '@/app/api/BlockApi';
import ProfileImage from '@/app/(primary)/_components/ProfileImage';
import { BlockListApi } from '@/types/Settings';
import List from '@/components/List/List';

export default function BlockManagement() {
  const { handleModalState, handleCloseModal } = useModalStore();
  const [blockedUsers, setBlockedUsers] = useState<BlockListApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [unblockingUsers, setUnblockingUsers] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    const fetchBlockList = async () => {
      try {
        const response = await BlockApi.getBlockList();
        if (response.data?.items) {
          setBlockedUsers(response.data);
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

  const handleUnblockUser = async (userId: string) => {
    try {
      setUnblockingUsers((prev) => new Set(prev).add(userId));
      await BlockApi.unblockUser(userId);
    } catch (error) {
      console.error('차단 해제 실패:', error);
      setUnblockingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleBlockUser = (userId: string, nickname: string) => {
    handleModalState({
      isShowModal: true,
      type: 'CONFIRM',
      mainText: `${nickname}님을 차단하시겠습니까?`,
      confirmBtnName: '예',
      cancelBtnName: '아니오',
      handleConfirm: async () => {
        try {
          await BlockApi.blockUser(userId);

          setUnblockingUsers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(userId);
            return newSet;
          });

          handleCloseModal();
        } catch (error) {
          console.error('차단 실패:', error);
          handleCloseModal();
        }
      },
      handleCancel: handleCloseModal,
    });
  };

  return (
    <>
      <div className="min-h-screen bg-white">
        <div className="px-6 pt-6">
          <List
            emptyViewText="차단된 사용자가 없습니다."
            isListFirstLoading={loading}
            isEmpty={(blockedUsers?.items?.length ?? 0) === 0}
          >
            <List.Total total={blockedUsers?.totalCount ?? 0} unit="명" />
            <List.Section>
              {blockedUsers?.items?.map((user, index) => {
                const isLast = index === blockedUsers.items.length - 1;
                const isUnblocking = unblockingUsers.has(user.userId);

                return (
                  <motion.div
                    key={user.userId}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    custom={index}
                    className="py-[14px]"
                  >
                    {index > 0 && (
                      <div className="border-t border-brightGray -mt-[14px] mb-[14px]" />
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-[10px]">
                        <ProfileImage size={36} />
                        <span className="text-13 font-bold text-mainDarkGray">
                          {user?.userName}
                        </span>
                      </div>

                      <button
                        onClick={() =>
                          isUnblocking
                            ? handleBlockUser(user.userId, user.userName)
                            : handleUnblockUser(user.userId)
                        }
                        className={`px-[10px] py-1 border border-subCoral rounded text-12 font-medium transition-colors flex-shrink-0 ${
                          isUnblocking
                            ? 'bg-subCoral text-white'
                            : 'text-subCoral'
                        }`}
                      >
                        {isUnblocking ? '차단하기' : '차단해제'}
                      </button>
                    </div>

                    {isLast && (
                      <div className="border-t border-brightGray mt-[14px] -mb-[14px]" />
                    )}
                  </motion.div>
                );
              })}
            </List.Section>
          </List>
        </div>
      </div>

      <Modal />
    </>
  );
}

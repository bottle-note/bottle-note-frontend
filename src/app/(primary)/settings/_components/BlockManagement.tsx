'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useBlockActions } from '@/hooks/useBlockActions';
import { BlockApi } from '@/api/block/block.api';
import type { BlockListResponse } from '@/api/block/types';
import ProfileImage from '@/components/domain/user/ProfileImage';
import List from '@/components/feature/List/List';
import { usePaginatedQuery } from '@/queries/usePaginatedQuery';
import { useAuthSession } from '@/hooks/auth/useAuthSession';

export default function BlockManagement() {
  const { isLoggedIn, user } = useAuthSession();
  const [unblockingUsers, setUnblockingUsers] = useState<Set<string>>(
    new Set(),
  );

  const {
    data: blockPages,
    isLoading,
    isFetching,
    targetRef,
  } = usePaginatedQuery<BlockListResponse>({
    queryKey: ['blocks', user?.userId],
    queryFn: ({ pageParam }) =>
      BlockApi.getBlockList({ cursor: pageParam, size: 20 }),
    enabled: isLoggedIn,
  });

  const blockedUsers = blockPages?.flatMap((page) => page.data.items) ?? [];

  const { handleBlockUser, handleUnblockUser } = useBlockActions({
    onUnblockStart: (userId) => {
      setUnblockingUsers((prev) => new Set(prev).add(userId));
    },
    onUnblockError: (userId) => {
      setUnblockingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    },
    onBlockSuccess: (userId) => {
      setUnblockingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    },
  });

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

  return (
    <>
      <div className="min-h-screen bg-bg-layer-default text-fg-neutral">
        <div className="px-6 pt-6">
          <List
            emptyViewText="차단된 사용자가 없습니다."
            isListFirstLoading={isLoading}
            isScrollLoading={isFetching}
            isEmpty={!isLoading && blockedUsers.length === 0}
          >
            <List.Section>
              {blockedUsers.map((user, index) => {
                const isLast = index === blockedUsers.length - 1;
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
                      <div className="border-t border-stroke-neutral-subtle -mt-[14px] mb-[14px]" />
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-[10px]">
                        <ProfileImage size={36} />
                        <span className="text-13 font-bold text-fg-neutral">
                          {user?.userName}
                        </span>
                      </div>

                      <button
                        onClick={() =>
                          isUnblocking
                            ? handleBlockUser(user.userId, user.userName)
                            : handleUnblockUser(user.userId, user.userName)
                        }
                        className={`px-[10px] py-1 border border-subCoral rounded text-12 font-medium transition-colors flex-shrink-0 ${
                          isUnblocking
                            ? 'bg-bg-brand-solid text-fg-brand-contrast'
                            : 'text-fg-brand'
                        }`}
                      >
                        {isUnblocking ? '차단하기' : '차단해제'}
                      </button>
                    </div>

                    {isLast && (
                      <div className="border-t border-stroke-neutral-subtle mt-[14px] -mb-[14px]" />
                    )}
                  </motion.div>
                );
              })}
            </List.Section>
            <div ref={targetRef} />
          </List>
        </div>
      </div>
    </>
  );
}

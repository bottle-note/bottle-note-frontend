import { useEffect } from 'react';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
import useRelationshipsStore from '@/store/relationshipsStore';
import { BlockApi } from '@/api/block/block.api';

export const useAuthInitializer = () => {
  const { isLoggedIn, isLoading } = useAuthSession();
  const { setBlocked } = useRelationshipsStore();

  useEffect(() => {
    const initializeRelationshipsUsers = async () => {
      try {
        const response = await BlockApi.getBlockUserIdList();
        if (response.data) {
          setBlocked(response.data.map(String));
        }
      } catch (error) {
        console.error('Failed to initialize blocked users:', error);
      }
    };

    if (!isLoading) {
      if (isLoggedIn) {
        initializeRelationshipsUsers();
      } else {
        setBlocked([]);
      }
    }
  }, [isLoggedIn, isLoading, setBlocked]);
};

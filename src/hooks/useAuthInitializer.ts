import { useEffect } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import useRelationshipsStore from '@/store/relationshipsStore';
import { BlockApi } from '@/app/api/BlockApi';

export const useAuthInitializer = () => {
  const { isLoggedIn, isLoading } = useAuth();
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

import { create } from 'zustand';
import { getUserData, setUserData, type UserData } from '../lib/auth';
import { apiClient } from '../lib/apiClient';

interface AuthState {
  user: UserData | null;
  verification_status: 'unverified' | 'pending' | 'verified' | 'rejected';
  is_verified: boolean;
  setUser: (user: UserData | null) => void;
  fetchUser: () => Promise<void>;
  setVerificationStatus: (status: 'unverified' | 'pending' | 'verified' | 'rejected') => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const initialUser = typeof window !== 'undefined' ? getUserData() : null;
  const userExtended = initialUser as any;
  const status = userExtended?.verification_status || 'unverified';
  const isVerified = !!userExtended?.is_verified;

  return {
    user: initialUser,
    verification_status: status,
    is_verified: isVerified,
    setUser: (user) => {
      if (user) {
        setUserData(user);
      }
      const userExt = user as any;
      set({ 
        user, 
        verification_status: userExt?.verification_status || 'unverified',
        is_verified: !!userExt?.is_verified
      });
    },
    fetchUser: async () => {
      const currentUser = getUserData();
      if (!currentUser) return;
      try {
        const res = await apiClient.get(`/user-detail?id=${currentUser.id}`);
        const data = res.data?.data || res.data;
        if (data) {
          const updatedUser = {
            ...currentUser,
            ...data
          };
          setUserData(updatedUser);
          set({
            user: updatedUser,
            verification_status: data.verification_status || 'unverified',
            is_verified: !!data.is_verified
          });
        }
      } catch (err) {
        console.error('Failed to fetch user in useAuthStore:', err);
      }
    },
    setVerificationStatus: (status) => {
      set({ verification_status: status });
    }
  };
});

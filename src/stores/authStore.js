import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            session: null,
            loading: true,

            setUser: (user) => set({ user }),
            setSession: (session) => set({ session, user: session?.user || null, loading: false }),
            setLoading: (loading) => set({ loading }),

            signOut: () => set({ user: null, session: null, loading: false }),
        }),
        {
            name: 'auth-storage',
        }
    )
);

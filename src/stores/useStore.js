import { create } from 'zustand';
import { storageService } from '../services/storage/supabaseService';

export const usePostStore = create((set, get) => ({
    posts: [],
    currentPost: null,
    loading: false,
    error: null,

    fetchPosts: async () => {
        set({ loading: true, error: null });
        try {
            const posts = await storageService.getPosts();
            set({ posts, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    createPost: async (post) => {
        set({ loading: true, error: null });
        try {
            const newPost = await storageService.createPost({
                ...post,
                created_at: new Date().toISOString(),
                status: 'draft',
            });
            set((state) => ({
                posts: [newPost, ...state.posts],
                loading: false,
            }));
            return newPost;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    updatePost: async (id, updates) => {
        set({ loading: true, error: null });
        try {
            const updatedPost = await storageService.updatePost(id, updates);
            set((state) => ({
                posts: state.posts.map((p) => (p.id === id ? updatedPost : p)),
                currentPost: state.currentPost?.id === id ? updatedPost : state.currentPost,
                loading: false,
            }));
            return updatedPost;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    deletePost: async (id) => {
        set({ loading: true, error: null });
        try {
            await storageService.deletePost(id);
            set((state) => ({
                posts: state.posts.filter((p) => p.id !== id),
                loading: false,
            }));
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    setCurrentPost: (post) => set({ currentPost: post }),
}));

export const useGoalStore = create((set) => ({
    goals: [],
    loading: false,
    error: null,

    fetchGoals: async () => {
        set({ loading: true, error: null });
        try {
            const goals = await storageService.getGoals();
            set({ goals, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    createGoal: async (goal) => {
        set({ loading: true, error: null });
        try {
            const newGoal = await storageService.createGoal(goal);
            set((state) => ({
                goals: [newGoal, ...state.goals],
                loading: false,
            }));
            return newGoal;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    updateGoal: async (id, updates) => {
        set({ loading: true, error: null });
        try {
            const updatedGoal = await storageService.updateGoal(id, updates);
            set((state) => ({
                goals: state.goals.map((g) => (g.id === id ? updatedGoal : g)),
                loading: false,
            }));
            return updatedGoal;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },
}));

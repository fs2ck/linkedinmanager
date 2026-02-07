import { create } from 'zustand';
import { storageService } from '../services/storage/supabaseService';
import { generate90DaySlots } from '../utils/plannerUtils';
import { addDays, format } from 'date-fns';

export const usePlannerStore = create((set, get) => ({
    currentPlan: null,
    plannedPosts: [],
    isLoading: false,
    error: null,

    fetchCurrentPlan: async () => {
        set({ isLoading: true });
        try {
            const cycle = await storageService.getActiveCycle();
            if (cycle) {
                const posts = await storageService.getPlannedPosts(cycle.id);
                set({ currentPlan: cycle, plannedPosts: posts, isLoading: false });
            } else {
                set({ currentPlan: null, plannedPosts: [], isLoading: false });
            }
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    createCycle: async ({ startDate, thesis }) => {
        set({ isLoading: true });
        try {
            const endDate = format(addDays(new Date(startDate), 90), 'yyyy-MM-dd');

            // 1. Criar Ciclo
            const cycle = await storageService.createCycle({
                start_date: startDate,
                end_date: endDate,
                thesis,
                status: 'active'
            });

            // 2. Gerar Slots de Posts
            const slots = generate90DaySlots(startDate).map(slot => ({
                ...slot,
                cycle_id: cycle.id
            }));

            // 3. Salvar no Banco
            const posts = await storageService.createPlannedPosts(slots);

            set({ currentPlan: cycle, plannedPosts: posts, isLoading: false });
            return cycle;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    updatePost: async (postId, updates) => {
        try {
            const updatedPost = await storageService.updatePlannedPost(postId, updates);
            set(state => ({
                plannedPosts: state.plannedPosts.map(p => p.id === postId ? updatedPost : p)
            }));
            return updatedPost;
        } catch (error) {
            set({ error: error.message });
            throw error;
        }
    }
}));

import { create } from 'zustand';
import { storageService as supabaseService } from '../services/storage/supabaseService';
import { groqService } from '../services/ai/groqService';
import { toast } from 'react-hot-toast';

export const usePlannerStore = create((set, get) => ({
    currentPlan: null,
    pillars: [],
    posts: [],
    isLoading: false,
    isGenerating: false,
    error: null,

    fetchCurrentPlan: async () => {
        set({ isLoading: true });
        try {
            const cycle = await supabaseService.getActiveCycle();
            if (cycle) {
                const pillars = await supabaseService.getPillars(cycle.id);
                const posts = await supabaseService.getPlannedPosts(cycle.id);
                set({ currentPlan: cycle, pillars, posts });
            } else {
                set({ currentPlan: null, pillars: [], posts: [] });
            }
        } catch (error) {
            console.error('Error fetching cycle:', error);
            set({ error: error.message });
        } finally {
            set({ isLoading: false });
        }
    },

    createCycle: async (cycleData, pillarsData) => {
        set({ isGenerating: true });
        try {
            // 1. Create Cycle in DB
            const cycle = await supabaseService.createCycle({
                ...cycleData,
                status: 'active'
            });

            // 2. Create Pillars in DB
            const pillarsWithId = pillarsData.map(p => ({
                ...p,
                cycle_id: cycle.id
            }));
            const createdPillars = await supabaseService.createPillars(pillarsWithId);

            // 3. Generate Plan with Groq
            // We pass the created cycle and pillars to Groq to generate posts
            const generatedPosts = await groqService.generateContentPlan(cycle, createdPillars);

            // 4. Save Generated Posts to DB
            const postsToSave = generatedPosts.map(post => ({
                ...post,
                cycle_id: cycle.id,
                status: 'planned'
            }));

            await supabaseService.createPlannedPosts(postsToSave);

            // 5. Update Store
            set({ currentPlan: cycle, pillars: createdPillars, posts: postsToSave });
            toast.success('Estratégia criada com sucesso!');
        } catch (error) {
            console.error('Error creating cycle:', error);
            toast.error('Erro ao criar estratégia: ' + error.message);
            set({ error: error.message });
        } finally {
            set({ isGenerating: false });
        }
    },

    updatePlannedPost: async (postId, updates) => {
        try {
            const updated = await supabaseService.updatePlannedPost(postId, updates);
            set(state => ({
                posts: state.posts.map(p => p.id === postId ? updated : p)
            }));
            toast.success('Post atualizado!');
        } catch (error) {
            console.error('Error updating post:', error);
            toast.error('Erro ao atualizar post.');
        }
    },

    deleteCurrentPlan: async () => {
        const { currentPlan } = get();
        if (!currentPlan) return;


        set({ isLoading: true });
        try {
            await supabaseService.deleteCycle(currentPlan.id);
            set({ currentPlan: null, pillars: [], posts: [] });
            toast.success('Plano excluído com sucesso.');
        } catch (error) {
            console.error('Error deleting plan:', error);
            toast.error('Erro ao excluir plano.');
        } finally {
            set({ isLoading: false });
        }
    }
}));

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not found. Please configure .env file.');
}

export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
);

// Storage service for managing posts, drafts, and goals
export const storageService = {
    // Posts
    async getPosts(filters = {}) {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async getPost(id) {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async createPost(post) {
        const { data, error } = await supabase
            .from('posts')
            .insert([post])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updatePost(id, updates) {
        const { data, error } = await supabase
            .from('posts')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deletePost(id) {
        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // Goals
    async getGoals() {
        const { data, error } = await supabase
            .from('goals')
            .select('*')
            .order('week_start', { ascending: false });

        if (error) throw error;
        return data;
    },

    async createGoal(goal) {
        const { data, error } = await supabase
            .from('goals')
            .insert([goal])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateGoal(id, updates) {
        const { data, error } = await supabase
            .from('goals')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Metrics
    async getMetrics(filters = {}) {
        let query = supabase
            .from('metrics')
            .select('*')
            .order('date', { ascending: false });

        if (filters.startDate) {
            query = query.gte('date', filters.startDate);
        }
        if (filters.endDate) {
            query = query.lte('date', filters.endDate);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    },

    async createMetric(metric) {
        const { data, error } = await supabase
            .from('metrics')
            .insert([metric])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Content Planner
    async getActiveCycle() {
        const { data, error } = await supabase
            .from('planning_cycles')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) throw error;
        return data;
    },

    async createCycle(cycleData) {
        const { data, error } = await supabase
            .from('planning_cycles')
            .insert([cycleData])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getPlannedPosts(cycleId) {
        const { data, error } = await supabase
            .from('planned_posts')
            .select('*')
            .eq('cycle_id', cycleId)
            .order('date', { ascending: true });

        if (error) throw error;
        return data;
    },

    async createPlannedPosts(posts) {
        const { data, error } = await supabase
            .from('planned_posts')
            .insert(posts)
            .select();

        if (error) throw error;
        return data;
    },

    async updatePlannedPost(id, updates) {
        const { data, error } = await supabase
            .from('planned_posts')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },
    // Weekly Goals (Manual)
    async getWeeklyGoal(userId) {
        const { data, error } = await supabase
            .from('weekly_goals')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) throw error;
        return data;
    },

    async updateWeeklyGoal(userId, target) {
        // Try to update existing or insert new
        const { data: existing } = await supabase
            .from('weekly_goals')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle();

        if (existing) {
            const { data, error } = await supabase
                .from('weekly_goals')
                .update({ target_engagement: target, updated_at: new Date() })
                .eq('id', existing.id)
                .select()
                .single();
            if (error) throw error;
            return data;
        } else {
            const { data, error } = await supabase
                .from('weekly_goals')
                .insert({ user_id: userId, target_engagement: target })
                .select()
                .single();
            if (error) throw error;
            return data;
        }
    },
};

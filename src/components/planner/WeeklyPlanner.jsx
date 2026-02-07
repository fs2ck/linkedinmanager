import React, { useState } from 'react';
import { usePlannerStore } from '../../stores/usePlannerStore';
import { ChevronDown, ChevronRight, Edit3, CheckCircle, Clock, Sparkles, Send, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import PillarBadge from './PillarBadge';
import { PILLARS, POST_FORMATS, POST_OBJECTIVES } from '../../utils/plannerUtils';

const WeeklyPlanner = () => {
    const { plannedPosts, currentPlan, updatePost } = usePlannerStore();
    const [openWeek, setOpenWeek] = useState(1);
    const [editingPost, setEditingPost] = useState(null);

    const weeks = {};
    for (let i = 1; i <= 12; i++) weeks[i] = [];
    plannedPosts.forEach(post => {
        if (weeks[post.week_number]) weeks[post.week_number].push(post);
    });

    const toggleWeek = (weekNum) => setOpenWeek(openWeek === weekNum ? null : weekNum);

    const handleSavePost = async (post, changes) => {
        await updatePost(post.id, changes);
        setEditingPost(null);
    };

    return (
        <div className="space-y-4 max-w-6xl mx-auto">
            {Object.keys(weeks).map(weekNum => {
                const weekPosts = weeks[weekNum];
                if (!weekPosts.length) return null;
                const weekStartDate = new Date(weekPosts[0].date);
                const isOpen = openWeek === parseInt(weekNum);

                return (
                    <div key={weekNum} className={`surface overflow-hidden ${isOpen ? 'ring-2 ring-primary-100 border-primary-200' : ''}`}>
                        <button
                            onClick={() => toggleWeek(parseInt(weekNum))}
                            className={`w-full flex items-center justify-between p-6 transition-all ${isOpen ? 'bg-slate-50/50 border-b border-slate-100' : 'bg-white hover:bg-slate-50'}`}
                        >
                            <div className="flex items-center space-x-5">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isOpen ? 'bg-primary-500 text-white shadow-lg shadow-primary-200' : 'bg-slate-100 text-slate-500'}`}>
                                    {isOpen ? <ChevronDown size={22} /> : <ChevronRight size={22} />}
                                </div>
                                <div className="text-left">
                                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Semana {weekNum}</h3>
                                    <span className="text-sm font-medium text-slate-400 flex items-center mt-0.5">
                                        <Calendar size={13} className="mr-1.5" />
                                        Início em {format(weekStartDate, "dd 'de' MMMM", { locale: ptBR })}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="flex -space-x-2.5">
                                    {weekPosts.map(p => {
                                        const pillar = PILLARS[p.pillar.toUpperCase()];
                                        return (
                                            <div
                                                key={p.id}
                                                className={`w-8 h-8 rounded-lg border-2 border-white flex items-center justify-center shadow-sm ${pillar?.color || 'bg-slate-300'}`}
                                                title={pillar?.label}
                                            >
                                                {/* Dot inside */}
                                                <div className="w-1.5 h-1.5 bg-white rounded-full opacity-60"></div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="h-8 w-px bg-slate-200"></div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isOpen ? 'bg-primary-50 text-primary-600' : 'bg-slate-100 text-slate-500'}`}>
                                    {weekPosts.length} Publicações
                                </span>
                            </div>
                        </button>

                        {isOpen && (
                            <div className="p-8 bg-slate-50/30 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
                                {weekPosts.map(post => (
                                    <PostSlotCard
                                        key={post.id}
                                        post={post}
                                        isEditing={editingPost === post.id}
                                        onEdit={() => setEditingPost(post.id)}
                                        onCancel={() => setEditingPost(null)}
                                        onSave={(changes) => handleSavePost(post, changes)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

const PostSlotCard = ({ post, isEditing, onEdit, onCancel, onSave }) => {
    const [formData, setFormData] = useState({ ...post });

    // Mapear dia da semana para PT-BR
    const dayLabels = { monday: 'Segunda', wednesday: 'Quarta', friday: 'Sexta' };

    const handleSave = () => {
        onSave(formData);
    };

    if (isEditing) {
        return (
            <div className="md:col-span-3 bg-white p-8 rounded-2xl shadow-premium border border-primary-100 animate-fade-in">
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary-500 text-white w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl">
                            {format(new Date(post.date), 'dd')}
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 text-lg leading-tight">{dayLabels[post.day_of_week]}</h4>
                            <p className="text-slate-400 text-sm font-medium">{format(new Date(post.date), 'MMMM yyyy', { locale: ptBR })}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={onCancel} className="btn btn-secondary px-6">Cancelar</button>
                        <button onClick={handleSave} className="btn btn-primary px-6">Salvar Post</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Título / Tema do Post</label>
                            <input
                                className="w-full text-xl font-bold border-none p-0 focus:ring-0 placeholder:text-slate-200"
                                value={formData.theme || ''}
                                onChange={e => setFormData({ ...formData, theme: e.target.value })}
                                placeholder="Sobre o que vamos falar?"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ângulo / Narrativa</label>
                            <textarea
                                className="w-full border-none p-0 focus:ring-0 h-32 resize-none text-slate-600 leading-relaxed placeholder:text-slate-300"
                                value={formData.angle || ''}
                                onChange={e => setFormData({ ...formData, angle: e.target.value })}
                                placeholder="Descreva o ponto de vista único para este conteúdo..."
                            />
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-2xl space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Estratégia</label>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase">Pilar</p>
                                    <select
                                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm font-semibold"
                                        value={formData.pillar}
                                        onChange={e => setFormData({ ...formData, pillar: e.target.value })}
                                    >
                                        {Object.values(PILLARS).map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase">Formato</p>
                                    <select
                                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm font-semibold"
                                        value={formData.format || ''}
                                        onChange={e => setFormData({ ...formData, format: e.target.value })}
                                    >
                                        {POST_FORMATS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-primary-200 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between min-h-[180px]"
            onClick={onEdit}
        >
            <div className="space-y-4">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                        <span className="text-2xl font-black text-slate-900 leading-none">{format(new Date(post.date), 'dd')}</span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">{dayLabels[post.day_of_week]}</span>
                    </div>
                    <PillarBadge pillarId={post.pillar} />
                </div>

                <h4 className={`text-base font-bold leading-snug group-hover:text-primary-600 transition-colors ${post.theme ? 'text-slate-800' : 'text-slate-300 italic'}`}>
                    {post.theme || 'Definir tema do post...'}
                </h4>
            </div>

            <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center text-xs font-bold text-slate-400 gap-1">
                    <Clock size={12} />
                    {POST_FORMATS.find(f => f.id === post.format)?.label || post.format}
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary-50 group-hover:text-primary-500 transition-all">
                    <Edit3 size={14} />
                </div>
            </div>
        </div>
    );
};

export default WeeklyPlanner;

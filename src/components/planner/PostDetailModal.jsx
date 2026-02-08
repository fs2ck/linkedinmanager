import React, { useState } from 'react';
import { usePlannerStore } from '../../stores/usePlannerStore';
import { Sparkles, Edit3, Target, Zap, FileText } from 'lucide-react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

const PostDetailModal = ({ post, onClose }) => {
    const { updatePlannedPost } = usePlannerStore();
    const [isEditing, setIsEditing] = useState(false);
    const [editedPost, setEditedPost] = useState({ ...post });

    if (!post) return null;

    const handleSave = async () => {
        console.log('Saving post:', editedPost);
        // await updatePlannedPost(post.id, editedPost);
        setIsEditing(false);
    };

    const footer = (
        <div className="flex justify-end gap-3 w-full">
            {isEditing ? (
                <>
                    <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancelar</Button>
                    <Button onClick={handleSave}>Salvar Alterações</Button>
                </>
            ) : (
                <>
                    <Button variant="secondary" onClick={() => setIsEditing(true)}>
                        <Edit3 size={16} className="mr-2" /> Editar
                    </Button>
                    <Button className="bg-slate-900 text-white hover:bg-slate-800">
                        Abrir no Editor
                    </Button>
                </>
            )}
        </div>
    );

    return (
        <Modal
            isOpen={!!post}
            onClose={onClose}
            title={isEditing ? 'Editar Publicação' : post.title}
            size="lg"
            footer={footer}
        >
            <div className="space-y-8 py-2">
                {/* Metadata Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                            <FileText size={12} /> Formato
                        </label>
                        <p className="font-semibold text-slate-700 bg-slate-100 px-3 py-2 rounded-xl inline-block text-sm">
                            {post.format}
                        </p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                            <Target size={12} /> Objetivo
                        </label>
                        <p className="font-semibold text-slate-700 bg-slate-100 px-3 py-2 rounded-xl inline-block text-sm">
                            {post.objective}
                        </p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                            <Zap size={12} /> Perspectiva
                        </label>
                        <p className="font-medium text-indigo-700 bg-indigo-50 px-3 py-2 rounded-xl border border-indigo-100 italic text-sm">
                            "{post.perspective}"
                        </p>
                    </div>
                </div>

                {/* Content Draft Area */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-slate-800 tracking-tight">Rascunho de Conteúdo</h3>
                        <Button size="sm" variant="secondary" className="text-indigo-600 border-indigo-100 hover:bg-white hover:shadow-sm">
                            <Sparkles size={14} className="mr-2 text-indigo-500" /> Gerar com IA
                        </Button>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 min-h-[250px] text-slate-400 italic text-center flex flex-col items-center justify-center gap-3">
                        <div className="bg-white p-4 rounded-full shadow-sm border border-slate-100">
                            <Sparkles size={32} className="text-indigo-300" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-bold text-slate-600">O conteúdo ainda não foi gerado.</p>
                            <p className="text-sm">Clique em "Gerar com IA" para criar a primeira versão baseada na estratégia.</p>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default PostDetailModal;

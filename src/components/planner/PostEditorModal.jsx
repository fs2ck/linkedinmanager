import React, { useState, useEffect, useCallback, useRef } from 'react';
import './PostEditorModal.css';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import RichTextEditor from '../ui/RichTextEditor';
import DateTimePicker from '../ui/DateTimePicker';
import Button from '../ui/Button';
import LinkedInPreview from './LinkedInPreview';
import { storageService } from '../../services/storage/supabaseService';
import { groqService } from '../../services/ai/groqService';
import { usePlannerStore } from '../../stores/usePlannerStore';
import { X, Sparkles, Trash2, Calendar, Save } from 'lucide-react';
import { format } from 'date-fns';

const AUTOSAVE_DELAY = 30000; // 30 seconds

export default function PostEditorModal({ post, onClose }) {
    const { updatePlannedPost, deletePlannedPost } = usePlannerStore();

    // Form state
    const [formData, setFormData] = useState({
        title: post?.title || '',
        format: post?.format || '',
        objective: post?.objective || '',
        perspective: post?.perspective || '',
        tone_of_voice: post?.tone_of_voice || '',
        size: post?.size || '',
        content: post?.content || '',
        media_url: post?.media_url || '',
        date: post?.date || post?.scheduled_date ? new Date(post.date || post.scheduled_date) : null,
        status: post?.status || 'draft'
    });

    // UI state
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Refs
    const autosaveTimerRef = useRef(null);
    const initialDataRef = useRef(JSON.stringify(formData));

    // Options for selects
    const formatOptions = [
        { value: 'Framework', label: 'Framework' },
        { value: 'Provocação', label: 'Provocação' },
        { value: 'Storytelling', label: 'Storytelling' },
        { value: 'Opinião', label: 'Opinião' },
        { value: 'Reflexão', label: 'Reflexão' },
        { value: 'Caso de uso', label: 'Caso de uso' }
    ];

    const objectiveOptions = [
        { value: 'Autoridade técnica', label: 'Autoridade técnica' },
        { value: 'Debate executivo', label: 'Debate executivo' },
        { value: 'Visibilidade C-level', label: 'Visibilidade C-level' }
    ];

    const toneOptions = [
        { value: 'Profissional', label: 'Profissional' },
        { value: 'Analítico', label: 'Analítico' },
        { value: 'Inspirador', label: 'Inspirador' },
        { value: 'Provocativo', label: 'Provocativo' }
    ];

    const sizeOptions = [
        { value: 'Curto (50-100 palavras)', label: 'Curto (50-100 palavras)' },
        { value: 'Médio (150-250 palavras)', label: 'Médio (150-250 palavras)' },
        { value: 'Longo (300-500 palavras)', label: 'Longo (300-500 palavras)' }
    ];

    // Handle form changes
    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setHasUnsavedChanges(true);
    };

    // Autosave function
    const savePost = useCallback(async () => {
        if (!post?.id || !hasUnsavedChanges) return;

        setIsSaving(true);
        try {
            // Ensure status is valid for database constraint
            const dataToSave = {
                ...formData,
                date: formData.date ? formData.date.toISOString() : null,
                status: formData.status === 'draft' ? 'planned' : formData.status
            };
            await storageService.updatePlannedPost(post.id, dataToSave);
            await updatePlannedPost(post.id, dataToSave);
            setLastSaved(new Date());
            setHasUnsavedChanges(false);
            initialDataRef.current = JSON.stringify(formData);
        } catch (error) {
            console.error('Error saving post:', error);
        } finally {
            setIsSaving(false);
        }
    }, [post?.id, formData, hasUnsavedChanges, updatePlannedPost]);

    // Sync formData with post prop changes
    useEffect(() => {
        if (post) {
            const newFormData = {
                title: post.title || '',
                format: post.format || '',
                objective: post.objective || '',
                perspective: post.perspective || '',
                tone_of_voice: post.tone_of_voice || '',
                size: post.size || '',
                content: post.content || '',
                media_url: post.media_url || '',
                date: post.date || post.scheduled_date ? new Date(post.date || post.scheduled_date) : null,
                status: post.status || 'draft'
            };
            setFormData(newFormData);
            initialDataRef.current = JSON.stringify(newFormData);
            setHasUnsavedChanges(false);
            setLastSaved(null);
        }
    }, [post?.id]); // Only re-run when post ID changes

    // Setup autosave
    useEffect(() => {
        if (hasUnsavedChanges) {
            if (autosaveTimerRef.current) {
                clearTimeout(autosaveTimerRef.current);
            }
            autosaveTimerRef.current = setTimeout(() => {
                savePost();
            }, AUTOSAVE_DELAY);
        }

        return () => {
            if (autosaveTimerRef.current) {
                clearTimeout(autosaveTimerRef.current);
            }
        };
    }, [formData, hasUnsavedChanges, savePost]);

    // Generate content with AI
    const handleGenerateContent = async () => {
        if (!formData.title || !formData.format || !formData.objective || !formData.perspective) {
            alert('Por favor, preencha título, formato, objetivo e perspectiva antes de gerar conteúdo.');
            return;
        }

        setIsGenerating(true);
        try {
            const content = await groqService.generatePostContent({
                title: formData.title,
                format: formData.format,
                objective: formData.objective,
                perspective: formData.perspective,
                toneOfVoice: formData.tone_of_voice || 'Profissional',
                size: formData.size || 'Médio (150-250 palavras)'
            });
            handleChange('content', content);
        } catch (error) {
            console.error('Error generating content:', error);
            alert('Erro ao gerar conteúdo. Tente novamente.');
        } finally {
            setIsGenerating(false);
        }
    };

    // Handle scheduling

    // Handle deletion
    const handleDelete = async () => {
        setIsSaving(true);
        try {
            await storageService.deletePlannedPost(post.id);
            await deletePlannedPost(post.id);
            onClose();
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('Erro ao excluir publicação.');
        } finally {
            setIsSaving(false);
        }
    };

    // Handle manual save
    const handleSaveDraft = async () => {
        await savePost();
        onClose();
    };

    if (!post) return null;

    return (
        <>
            <Modal
                isOpen={!!post}
                onClose={onClose}
                size="fullscreen"
                hideHeader
                hideFooter
            >
                <div className="post-editor-container">
                    {/* Header */}
                    <div className="post-editor-header">
                        <div className="post-editor-header-left">
                            <h2 className="post-editor-title">{formData.title || 'Editar Publicação'}</h2>
                            {lastSaved && (
                                <span className="post-editor-saved-indicator">
                                    Salvo {format(lastSaved, 'HH:mm')}
                                </span>
                            )}
                            {isSaving && (
                                <span className="post-editor-saving-indicator">
                                    Salvando...
                                </span>
                            )}
                        </div>
                        <button className="post-editor-close" onClick={onClose}>
                            <X size={24} />
                        </button>
                    </div>

                    {/* Main Content - 2 Columns */}
                    <div className="post-editor-main">
                        {/* Left Column - Editor */}
                        <div className="post-editor-column post-editor-left">
                            <div className="post-editor-section">
                                <h3 className="post-editor-section-title">EDITOR</h3>

                                {/* Title */}
                                <Input
                                    label="Título da Publicação"
                                    value={formData.title}
                                    onChange={(e) => handleChange('title', e.target.value)}
                                    placeholder="Digite o título..."
                                    fullWidth
                                />

                                {/* Configuration Row */}
                                <div className="post-editor-config-grid">
                                    <Select
                                        label="FORMATO"
                                        value={formData.format}
                                        onChange={(e) => handleChange('format', e.target.value)}
                                        options={formatOptions}
                                        placeholder="Selecione..."
                                    />
                                    <Select
                                        label="OBJETIVO"
                                        value={formData.objective}
                                        onChange={(e) => handleChange('objective', e.target.value)}
                                        options={objectiveOptions}
                                        placeholder="Selecione..."
                                    />
                                    <Select
                                        label="PERSPECTIVA"
                                        value={formData.perspective}
                                        onChange={(e) => handleChange('perspective', e.target.value)}
                                        options={[
                                            { value: 'Analítica', label: 'Analítica' },
                                            { value: 'Estratégica', label: 'Estratégica' },
                                            { value: 'Operacional', label: 'Operacional' }
                                        ]}
                                        placeholder="Selecione..."
                                    />
                                </div>

                                <div className="post-editor-config-grid post-editor-config-grid-3">
                                    <DateTimePicker
                                        label="DATA E HORA"
                                        value={formData.date}
                                        onChange={(date) => handleChange('date', date)}
                                        minDate={new Date()}
                                        placeholderText="Agendar publicação..."
                                    />
                                    <Select
                                        label="TOM DE VOZ"
                                        value={formData.tone_of_voice}
                                        onChange={(e) => handleChange('tone_of_voice', e.target.value)}
                                        options={toneOptions}
                                        placeholder="Selecione..."
                                    />
                                    <Select
                                        label="TAMANHO"
                                        value={formData.size}
                                        onChange={(e) => handleChange('size', e.target.value)}
                                        options={sizeOptions}
                                        placeholder="Selecione..."
                                    />
                                </div>

                                {/* Generate Button */}
                                <Button
                                    variant="secondary"
                                    onClick={handleGenerateContent}
                                    disabled={isGenerating}
                                    icon={Sparkles}
                                    className="post-editor-generate-btn"
                                >
                                    {isGenerating ? 'Gerando...' : 'Gerar com IA'}
                                </Button>

                                {/* Rich Text Editor */}
                                <RichTextEditor
                                    label="Conteúdo"
                                    value={formData.content}
                                    onChange={(value) => handleChange('content', value)}
                                    placeholder="Escreva o conteúdo da publicação..."
                                />
                            </div>
                        </div>

                        {/* Right Column - Preview */}
                        <div className="post-editor-column post-editor-right">
                            <LinkedInPreview
                                title={formData.title}
                                content={formData.content}
                                mediaUrl={formData.media_url}
                            />
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="post-editor-footer">
                        <Button
                            variant="ghost"
                            onClick={() => setShowDeleteModal(true)}
                            icon={Trash2}
                            className="post-editor-delete-btn"
                        >
                            Excluir Publicação
                        </Button>
                        <div className="post-editor-footer-right">
                            <Button variant="ghost" onClick={onClose}>
                                Cancelar
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={handleSaveDraft}
                                icon={Save}
                                disabled={isSaving}
                            >
                                Salvar Rascunho
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <Modal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    title="Excluir Publicação"
                    size="popup"
                    footer={
                        <div className="modal-footer-actions">
                            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
                                Cancelar
                            </Button>
                            <Button variant="danger" onClick={handleDelete} disabled={isSaving}>
                                Excluir
                            </Button>
                        </div>
                    }
                >
                    <p>Tem certeza que deseja excluir esta publicação? Esta ação não pode ser desfeita.</p>
                </Modal>
            )}


        </>
    );
}

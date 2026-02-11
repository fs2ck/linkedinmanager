import { useState, useEffect } from 'react';
import { Sparkles, Wand2, Trash2, BookOpen, Clock, Plus, Share2 } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input, { Textarea } from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { groqService as aiService } from '../services/ai/groqService';
import { usePostStore } from '../stores/useStore';
import SendToPlannerModal from '../components/planner/SendToPlannerModal';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import './DraftStudio.css';

export default function DraftStudio() {
    const [topic, setTopic] = useState('');
    const [tone, setTone] = useState('professional');
    const [length, setLength] = useState('medium');
    const [context, setContext] = useState('');
    const [generating, setGenerating] = useState(false);
    const [generatedDraft, setGeneratedDraft] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [isPlannerModalOpen, setIsPlannerModalOpen] = useState(false);

    const { posts, fetchPosts, createPost, updatePost, deletePost, loading: postsLoading } = usePostStore();

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const drafts = posts.filter(p => p.status === 'draft');

    const handleGenerate = async () => {
        if (!topic.trim()) {
            toast.error('Por favor, insira um tópico');
            return;
        }

        setGenerating(true);
        try {
            const draft = await aiService.generateDraft({
                topic,
                tone,
                length,
                context,
            });
            setGeneratedDraft(draft);
            toast.success('Rascunho gerado com sucesso!');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setGenerating(false);
        }
    };

    const handleNewDraft = () => {
        setEditingId(null);
        setTopic('');
        setGeneratedDraft('');
        setContext('');
    };

    const handleSaveDraft = async () => {
        if (!generatedDraft) return;

        try {
            if (editingId) {
                await updatePost(editingId, {
                    title: topic,
                    content: generatedDraft
                });
                toast.success('Rascunho atualizado!');
            } else {
                const newPost = await createPost({
                    title: topic,
                    content: generatedDraft,
                    status: 'draft',
                });
                setEditingId(newPost.id);
                toast.success('Rascunho salvo!');
            }
        } catch (error) {
            toast.error('Erro ao salvar rascunho');
        }
    };

    const handleLoadDraft = (draft) => {
        setEditingId(draft.id);
        setTopic(draft.title);
        setGeneratedDraft(draft.content);
        toast.success('Rascunho carregado!');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteDraft = async (e, id) => {
        e.stopPropagation();
        if (confirm('Tem certeza que deseja excluir este rascunho?')) {
            try {
                await deletePost(id);
                if (editingId === id) handleNewDraft();
                toast.success('Rascunho excluído');
            } catch (error) {
                toast.error('Erro ao excluir rascunho');
            }
        }
    };

    const toneOptions = [
        { value: 'professional', label: 'Profissional' },
        { value: 'casual', label: 'Casual' },
        { value: 'inspirational', label: 'Inspirador' },
        { value: 'educational', label: 'Educacional' },
    ];

    const lengthOptions = [
        { value: 'short', label: 'Curto (100-150 palavras)' },
        { value: 'medium', label: 'Médio (150-250 palavras)' },
        { value: 'long', label: 'Longo (250-400 palavras)' },
    ];

    return (
        <DashboardLayout
            title="Draft Studio"
            headerActions={
                <Button
                    variant="secondary"
                    size="sm"
                    icon={<Plus size={16} />}
                    onClick={handleNewDraft}
                >
                    Novo Rascunho
                </Button>
            }
        >
            <div className="draft-studio-container">
                <div className="draft-studio-grid">
                    {/* Generation Form */}
                    <Card className="generation-form">
                        <h2 className="section-title">
                            <Sparkles size={24} />
                            {editingId ? 'Editando Rascunho' : 'Gerar Novo Rascunho'}
                        </h2>

                        <div className="form-group">
                            <Input
                                label="Tópico do Post"
                                placeholder="Ex: Como a IA está transformando o mercado de trabalho"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                fullWidth
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="input-label">Tom</label>
                                <div className="tone-options">
                                    {toneOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            className={`tone-btn ${tone === option.value ? 'active' : ''}`}
                                            onClick={() => setTone(option.value)}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="input-label">Tamanho</label>
                            <div className="length-options">
                                {lengthOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        className={`length-btn ${length === option.value ? 'active' : ''}`}
                                        onClick={() => setLength(option.value)}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <Textarea
                                label="Contexto Adicional (Opcional)"
                                placeholder="Adicione informações extras, pontos específicos que deseja abordar, etc."
                                value={context}
                                onChange={(e) => setContext(e.target.value)}
                                rows={4}
                            />
                        </div>

                        <Button
                            variant="primary"
                            size="lg"
                            fullWidth
                            onClick={handleGenerate}
                            disabled={generating}
                            icon={<Wand2 size={20} />}
                        >
                            {generating ? 'Gerando...' : (editingId ? 'Gerar Novamente' : 'Gerar Rascunho com IA')}
                        </Button>
                    </Card>

                    {/* Generated Draft Preview */}
                    <Card className="draft-preview">
                        <h2 className="section-title">Visualização</h2>

                        {generatedDraft ? (
                            <>
                                <div className="draft-content">
                                    <pre className="draft-text">{generatedDraft}</pre>
                                </div>

                                <div className="draft-actions">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        icon={<Share2 size={16} />}
                                        onClick={() => setIsPlannerModalOpen(true)}
                                    >
                                        Transformar em Planejamento
                                    </Button>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setGeneratedDraft('')}
                                        >
                                            Descartar
                                        </Button>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={handleSaveDraft}
                                        >
                                            {editingId ? 'Salvar Edição' : 'Salvar Rascunho'}
                                        </Button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="empty-state">
                                <Sparkles size={48} className="empty-icon" />
                                <p>Carregue um rascunho ou gere um novo</p>
                                <p className="empty-hint">
                                    Sua obra aparecerá aqui
                                </p>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Drafts Gallery */}
                <div className="drafts-gallery-section">
                    <h2 className="section-title">
                        <BookOpen size={24} />
                        Galeria de Rascunhos
                    </h2>

                    <div className="drafts-list-grid">
                        {drafts.length === 0 ? (
                            <Card className="empty-gallery">
                                <p>Nenhum rascunho salvo ainda.</p>
                            </Card>
                        ) : (
                            drafts.map((draft) => (
                                <Card
                                    key={draft.id}
                                    className={`draft-card ${editingId === draft.id ? 'editing' : ''}`}
                                    onClick={() => handleLoadDraft(draft)}
                                >
                                    <div className="draft-card-header">
                                        <h3 className="draft-card-title">{draft.title}</h3>
                                        <button
                                            className="delete-draft-btn"
                                            onClick={(e) => handleDeleteDraft(e, draft.id)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="draft-card-preview">
                                        {draft.content.substring(0, 150)}...
                                    </div>
                                    <div className="draft-card-footer">
                                        <div className="draft-date">
                                            <Clock size={14} />
                                            {format(new Date(draft.created_at), "dd 'de' MMMM", { locale: ptBR })}
                                        </div>
                                        <Badge variant="neutral">Rascunho</Badge>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <SendToPlannerModal
                isOpen={isPlannerModalOpen}
                onClose={() => setIsPlannerModalOpen(false)}
                draftContent={generatedDraft}
                draftTitle={topic}
            />
        </DashboardLayout>
    );
}

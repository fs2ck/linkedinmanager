import { useState } from 'react';
import { Sparkles, Wand2 } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input, { Textarea } from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { aiService } from '../services/ai/groqService';
import { usePostStore } from '../stores/useStore';
import toast from 'react-hot-toast';
import './DraftStudio.css';

export default function DraftStudio() {
    const [topic, setTopic] = useState('');
    const [tone, setTone] = useState('professional');
    const [length, setLength] = useState('medium');
    const [context, setContext] = useState('');
    const [generating, setGenerating] = useState(false);
    const [generatedDraft, setGeneratedDraft] = useState('');

    const createPost = usePostStore((state) => state.createPost);

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

    const handleSaveDraft = async () => {
        if (!generatedDraft) return;

        try {
            await createPost({
                title: topic,
                content: generatedDraft,
                status: 'draft',
            });
            toast.success('Rascunho salvo!');
            setGeneratedDraft('');
            setTopic('');
            setContext('');
        } catch (error) {
            toast.error('Erro ao salvar rascunho');
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
        <DashboardLayout title="Gerador de Rascunhos">
            <div className="draft-studio-container">
                <div className="draft-studio-grid">
                    {/* Generation Form */}
                    <Card className="generation-form">
                        <h2 className="section-title">
                            <Sparkles size={24} />
                            Gerar Novo Rascunho
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
                            {generating ? 'Gerando...' : 'Gerar Rascunho com IA'}
                        </Button>
                    </Card>

                    {/* Generated Draft Preview */}
                    <Card className="draft-preview">
                        <h2 className="section-title">Rascunho Gerado</h2>

                        {generatedDraft ? (
                            <>
                                <div className="draft-content">
                                    <pre className="draft-text">{generatedDraft}</pre>
                                </div>

                                <div className="draft-actions">
                                    <Button
                                        variant="secondary"
                                        onClick={() => setGeneratedDraft('')}
                                    >
                                        Descartar
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={handleSaveDraft}
                                    >
                                        Salvar Rascunho
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="empty-state">
                                <Sparkles size={48} className="empty-icon" />
                                <p>Seu rascunho gerado aparecerá aqui</p>
                                <p className="empty-hint">
                                    Preencha o formulário e clique em "Gerar Rascunho com IA"
                                </p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}

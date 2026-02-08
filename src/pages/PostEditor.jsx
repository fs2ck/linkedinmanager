import { useState } from 'react';
import { Send, Copy, MessageSquare, Sparkles } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Textarea } from '../components/ui/Input';
import { groqService as aiService } from '../services/ai/groqService';
import { linkedinService } from '../services/linkedin/linkedinService';
import toast from 'react-hot-toast';
import './PostEditor.css';

export default function PostEditor() {
    const [content, setContent] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    const [userMessage, setUserMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRefine = async (instructions) => {
        if (!content.trim()) {
            toast.error('Adicione conteúdo primeiro');
            return;
        }

        setLoading(true);
        try {
            const refined = await aiService.refineDraft({
                content,
                instructions,
            });
            setContent(refined);
            toast.success('Post refinado!');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSuggest = async () => {
        if (!content.trim()) {
            toast.error('Adicione conteúdo primeiro');
            return;
        }

        setLoading(true);
        try {
            const suggestions = await aiService.suggestImprovements(content);

            setChatMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: suggestions,
                },
            ]);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChat = async () => {
        if (!userMessage.trim()) return;

        const newMessage = { role: 'user', content: userMessage };
        setChatMessages((prev) => [...prev, newMessage]);
        setUserMessage('');

        setLoading(true);
        try {
            const response = await aiService.chatWithAgent({
                messages: [...chatMessages, newMessage],
                systemPrompt: `Você é um assistente especializado em refinar posts do LinkedIn. O post atual é:\n\n${content}\n\nAjude o usuário a melhorar este post.`,
            });

            setChatMessages((prev) => [
                ...prev,
                { role: 'assistant', content: response },
            ]);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyToClipboard = async () => {
        try {
            await linkedinService.copyToClipboard(content);
            toast.success('Post copiado! Pronto para colar no LinkedIn.');
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleOpenLinkedIn = () => {
        linkedinService.openLinkedInComposer();
    };

    const quickActions = [
        { label: 'Tornar mais engajador', action: () => handleRefine('Torne este post mais engajador e atrativo') },
        { label: 'Simplificar linguagem', action: () => handleRefine('Simplifique a linguagem para ser mais acessível') },
        { label: 'Adicionar call-to-action', action: () => handleRefine('Adicione uma call-to-action forte no final') },
        { label: 'Melhorar formatação', action: () => handleRefine('Melhore a formatação com parágrafos curtos e espaçamento') },
    ];

    return (
        <DashboardLayout
            title="Editor de Posts"
            headerActions={
                <>
                    <Button variant="secondary" size="sm" icon={<Copy size={16} />} onClick={handleCopyToClipboard}>
                        Copiar
                    </Button>
                    <Button variant="primary" size="sm" icon={<Send size={16} />} onClick={handleOpenLinkedIn}>
                        Abrir LinkedIn
                    </Button>
                </>
            }
        >
            <div className="editor-container">
                <div className="editor-grid">
                    {/* Main Editor */}
                    <div className="editor-main">
                        <Card>
                            <h2 className="section-title">Conteúdo do Post</h2>
                            <Textarea
                                placeholder="Cole ou escreva seu post aqui..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={15}
                            />

                            <div className="quick-actions">
                                <h3>Ações Rápidas</h3>
                                <div className="quick-actions-grid">
                                    {quickActions.map((action, index) => (
                                        <button
                                            key={index}
                                            className="quick-action-btn"
                                            onClick={action.action}
                                            disabled={loading}
                                        >
                                            <Sparkles size={16} />
                                            {action.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </Card>

                        {/* Preview */}
                        <Card>
                            <h2 className="section-title">Preview LinkedIn</h2>
                            <div className="linkedin-preview">
                                <div className="preview-header">
                                    <div className="preview-avatar">FB</div>
                                    <div className="preview-info">
                                        <div className="preview-name">Felipe Barbosa</div>
                                        <div className="preview-meta">Agora</div>
                                    </div>
                                </div>
                                <div className="preview-content">
                                    {content || 'Seu post aparecerá aqui...'}
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* AI Assistant Chat */}
                    <div className="editor-sidebar">
                        <Card className="chat-card">
                            <h2 className="section-title">
                                <MessageSquare size={20} />
                                Assistente IA
                            </h2>

                            <Button
                                variant="secondary"
                                size="sm"
                                fullWidth
                                onClick={handleSuggest}
                                disabled={loading}
                                icon={<Sparkles size={16} />}
                            >
                                Sugerir Melhorias
                            </Button>

                            <div className="chat-messages">
                                {chatMessages.length === 0 ? (
                                    <div className="chat-empty">
                                        <MessageSquare size={32} className="empty-icon" />
                                        <p>Converse com a IA para refinar seu post</p>
                                    </div>
                                ) : (
                                    chatMessages.map((msg, index) => (
                                        <div key={index} className={`chat-message ${msg.role}`}>
                                            <div className="message-content">{msg.content}</div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="chat-input">
                                <Textarea
                                    placeholder="Pergunte algo ou peça ajuda..."
                                    value={userMessage}
                                    onChange={(e) => setUserMessage(e.target.value)}
                                    rows={3}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleChat();
                                        }
                                    }}
                                />
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={handleChat}
                                    disabled={loading || !userMessage.trim()}
                                >
                                    Enviar
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

import React from 'react';
import './LinkedInPreview.css';
import { MoreHorizontal, ThumbsUp, MessageCircle, Repeat2, Send } from 'lucide-react';
import Avatar from '../ui/Avatar';

export default function LinkedInPreview({
    title,
    content,
    mediaUrl,
    author = {
        name: 'Ricardo Oliveira',
        headline: 'Head of Strategy @ TechGlobal | Sustentabilidade & Inovação',
        avatar: null
    },
    timestamp = 'Agora'
}) {
    // Strip HTML tags for preview (simple version)
    const stripHtml = (html) => {
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };

    const contentText = content ? stripHtml(content) : '';
    const displayContent = contentText || 'Seu conteúdo aparecerá aqui...';

    return (
        <div className="linkedin-preview">
            <div className="linkedin-preview-header">
                <h3 className="linkedin-preview-title">VISUALIZAÇÃO NA PLATAFORMA</h3>
            </div>

            <div className="linkedin-post-card">
                {/* Post Header */}
                <div className="linkedin-post-header">
                    <div className="linkedin-post-author">
                        <Avatar
                            src={author.avatar}
                            alt={author.name}
                            size="md"
                            fallback={author.name?.charAt(0) || 'R'}
                        />
                        <div className="linkedin-post-author-info">
                            <div className="linkedin-post-author-name">{author.name}</div>
                            <div className="linkedin-post-author-headline">{author.headline}</div>
                            <div className="linkedin-post-timestamp">
                                {timestamp} • <span className="linkedin-globe-icon">🌐</span>
                            </div>
                        </div>
                    </div>
                    <button className="linkedin-post-menu">
                        <MoreHorizontal size={20} />
                    </button>
                </div>

                {/* Post Content */}
                <div className="linkedin-post-content">
                    {title && <div className="linkedin-post-title">{title}</div>}
                    <div className="linkedin-post-text">
                        {displayContent}
                    </div>
                </div>

                {/* Post Media */}
                {mediaUrl && (
                    <div className="linkedin-post-media">
                        <img src={mediaUrl} alt="Post media" />
                    </div>
                )}

                {/* Post Engagement */}
                <div className="linkedin-post-engagement">
                    <div className="linkedin-post-reactions">
                        <div className="linkedin-reaction-icons">
                            <span className="linkedin-reaction-icon linkedin-like">👍</span>
                            <span className="linkedin-reaction-icon linkedin-celebrate">🎉</span>
                            <span className="linkedin-reaction-icon linkedin-support">💡</span>
                        </div>
                        <span className="linkedin-reaction-count">0</span>
                    </div>
                    <div className="linkedin-post-stats">
                        <span>0 comentários</span>
                    </div>
                </div>

                {/* Post Actions */}
                <div className="linkedin-post-actions">
                    <button className="linkedin-action-button">
                        <ThumbsUp size={20} />
                        <span>Gostei</span>
                    </button>
                    <button className="linkedin-action-button">
                        <MessageCircle size={20} />
                        <span>Comentar</span>
                    </button>
                    <button className="linkedin-action-button">
                        <Repeat2 size={20} />
                        <span>Compartilhar</span>
                    </button>
                    <button className="linkedin-action-button">
                        <Send size={20} />
                        <span>Enviar</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

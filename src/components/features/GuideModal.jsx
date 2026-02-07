import { createPortal } from 'react-dom';
import { X, ExternalLink, Info, Map, CheckCircle2 } from 'lucide-react';
import './GuideModal.css';

export default function GuideModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content guide-modal" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    <X size={20} />
                </button>

                <div className="modal-header">
                    <div className="header-icon-wrapper">
                        <Map size={24} className="header-icon" />
                    </div>
                    <div>
                        <h2>Guia de Importação LinkedIn</h2>
                        <p>Siga os passos abaixo para alimentar seu dashboard com dados reais.</p>
                    </div>
                </div>

                <div className="modal-body">
                    <section className="guide-section">
                        <div className="section-title">
                            <span className="step-number">1</span>
                            <h3>Extrair dados do LinkedIn</h3>
                        </div>

                        <div className="guide-card">
                            <h4>Páginas de Empresa (Company Pages):</h4>
                            <ul>
                                <li>Acesse sua página no modo <strong>Administrador</strong>.</li>
                                <li>Vá em <strong>Análises (Analytics)</strong> &rarr; <strong>Publicações (Updates)</strong>.</li>
                                <li>Selecione o período e clique em <strong>Exportar (Export)</strong>.</li>
                                <li className="tip"><strong>Novidade:</strong> Agora você pode subir o arquivo .xlsx direto do Excel!</li>
                            </ul>
                        </div>

                        <div className="guide-card">
                            <h4>Perfil Pessoal (Creator Mode):</h4>
                            <ul>
                                <li>Vá em <strong>Análises do Criador (Creator Analytics)</strong> no seu perfil.</li>
                                <li>Acesse a aba <strong>Conteúdo (Posts)</strong>.</li>
                                <li>Clique em <strong>Exportar</strong> e escolha o período.</li>
                            </ul>
                        </div>
                    </section>

                    <section className="guide-section">
                        <div className="section-title">
                            <span className="step-number">2</span>
                            <h3>Subir na Plataforma</h3>
                        </div>
                        <div className="guide-card success-card">
                            <p>No Dashboard, clique no botão <strong>"Importar Dados"</strong> e arraste seu arquivo CSV. O sistema processará tudo automaticamente!</p>
                        </div>
                    </section>

                    <section className="guide-section">
                        <div className="section-title">
                            <span className="step-number">3</span>
                            <h3>O que importamos?</h3>
                        </div>
                        <div className="metrics-grid">
                            <div className="metric-item">
                                <CheckCircle2 size={16} />
                                <span>Impressões</span>
                            </div>
                            <div className="metric-item">
                                <CheckCircle2 size={16} />
                                <span>Reações</span>
                            </div>
                            <div className="metric-item">
                                <CheckCircle2 size={16} />
                                <span>Comentários</span>
                            </div>
                            <div className="metric-item">
                                <CheckCircle2 size={16} />
                                <span>Shares</span>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="modal-footer">
                    <button className="btn-primary-full" onClick={onClose}>
                        Entendi, vamos lá!
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

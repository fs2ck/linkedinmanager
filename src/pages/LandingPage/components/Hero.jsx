import React from 'react';
import { ArrowRight, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Hero() {
    const navigate = useNavigate();

    return (
        <section id="home" className="hero-section">
            <div className="hero-container">
                <div className="hero-text">
                    <span className="section-tag">✨ O Futuro do Personal Branding</span>
                    <h1 className="hero-title">
                        Transforme seu<br />Perfil do LinkedIn<br />em uma <span>Máquina<br />de Oportunidades</span>
                    </h1>
                    <p className="hero-description">
                        Automatize seu conteúdo estratégico, expanda seu alcance orgânico
                        e conquiste autoridade no mercado com nossa IA treinada para o algoritmo do LinkedIn.
                    </p>

                    <div className="hero-btns">
                        <button className="hero-btn-primary" onClick={() => navigate('/login')}>
                            Quero elevar meu perfil <ArrowRight size={18} />
                        </button>
                    </div>

                    <div className="hero-social-proof" style={{ marginTop: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div className="avatars" style={{ display: 'flex' }}>
                            {[1, 2, 3].map(i => (
                                <div key={i} style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: '#ddd',
                                    border: '2px solid white',
                                    marginLeft: i > 1 ? '-10px' : 0,
                                    backgroundImage: `url(https://i.pravatar.cc/100?img=${i + 10})`,
                                    backgroundSize: 'cover'
                                }} />
                            ))}
                        </div>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-body)', fontWeight: 500 }}>
                            Junte-se a <strong>+2.500 profissionais</strong>
                        </span>
                    </div>
                </div>

                <div className="hero-visual">
                    <div className="hero-mockup">
                        <img
                            src="/images/hero_illustration.png"
                            alt="Ilustração Flat Vector ElevateIn — Estratégia de Conteúdo e Branding no LinkedIn"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

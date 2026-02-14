import React from 'react';
import { Rocket, Target, Zap, TrendingUp } from 'lucide-react';

export default function About() {
    return (
        <section id="about" className="landing-section about-section">
            <div className="about-container">
                <div className="about-header">
                    <span className="about-badge">Nossa Missão</span>
                    <h2 className="about-title">Potencializando sua voz no LinkedIn</h2>
                    <p className="about-subtitle">
                        O ElevateIn nasceu para simplificar a construção de autoridade digital,
                        removendo as barreiras técnicas entre suas ideias e o sucesso na rede.
                    </p>
                </div>

                <div className="about-grid">
                    <div className="about-feature-card">
                        <div className="feature-icon-box">
                            <Target size={24} />
                        </div>
                        <h4 className="feature-card-title">Propósito Claro</h4>
                        <p className="feature-card-text">
                            Ajudamos profissionais a manterem a consistência sem o esgotamento criativo tradicional.
                        </p>
                    </div>

                    <div className="about-feature-card">
                        <div className="feature-icon-box icon-purple">
                            <Zap size={24} />
                        </div>
                        <h4 className="feature-card-title">DNA Tecnológico</h4>
                        <p className="feature-card-text">
                            Unimos inteligência artificial de ponta com as melhores práticas de escrita persuasiva.
                        </p>
                    </div>

                    <div className="about-feature-card">
                        <div className="feature-icon-box icon-indigo">
                            <TrendingUp size={24} />
                        </div>
                        <h4 className="feature-card-title">Foco em Resultados</h4>
                        <p className="feature-card-text">
                            Cada funcionalidade é desenhada para converter visualizações em conexões reais.
                        </p>
                    </div>
                </div>

                <div className="about-footer-info">
                    <p>
                        Acreditamos que todo profissional tem uma história que merece ser contada de forma impactante.
                        Nossa ferramenta é o catalisador dessa jornada.
                    </p>
                </div>
            </div>
        </section>
    );
}

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CTA() {
    const navigate = useNavigate();

    return (
        <section className="landing-section final-cta">
            <div className="final-cta-inner">
                <h2 className="section-title" style={{ color: 'white', marginBottom: '16px' }}>
                    Pronto para elevar seu perfil?
                </h2>
                <p className="section-description" style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '32px' }}>
                    Junte-se aos milhares de profissionais que estão escalando autoridade<br />
                    e gerando leads qualificados no LinkedIn todos os dias.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <button
                        className="hero-btn-primary"
                        style={{ background: 'white', color: 'var(--primary-indigo)' }}
                        onClick={() => navigate('/login')}
                    >
                        Começar Agora - Grátis <ArrowRight size={18} />
                    </button>
                    <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                        Sem necessidade de cartão de crédito
                    </span>
                </div>
            </div>
        </section>
    );
}

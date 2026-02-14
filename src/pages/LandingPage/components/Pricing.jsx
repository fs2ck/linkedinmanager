import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Pricing() {
    const navigate = useNavigate();

    const plans = [
        {
            name: "Grátis",
            description: "Para quem está começando",
            price: "R$ 0",
            period: "/mês",
            features: [
                { text: "5 posts gerados por mês", included: true },
                { text: "Analytics básico", included: true },
                { text: "Agendamento automático", included: false }
            ],
            cta: "Começar Agora",
            highlight: false
        },
        {
            name: "Pro",
            description: "Para profissionais ambiciosos",
            price: "R$ 49",
            period: "/mês",
            features: [
                { text: "Posts ilimitados com IA", included: true },
                { text: "Treinamento de tom de voz", included: true },
                { text: "Agendamento avançado", included: true },
                { text: "Suporte prioritário", included: true }
            ],
            cta: "Em Breve",
            highlight: true,
            badge: "Mais Popular"
        },
        {
            name: "Enterprise",
            description: "Para equipes e agências",
            price: "R$ 149",
            period: "/mês",
            features: [
                { text: "Até 5 perfis conectados", included: true },
                { text: "Relatórios de marca branca", included: true },
                { text: "Gerente de conta dedicado", included: true },
                { text: "API Access", included: true }
            ],
            cta: "Em Breve",
            highlight: false
        }
    ];

    return (
        <section className="landing-section" id="pricing">
            <div className="section-header">
                <h2 className="section-title">
                    Planos para todas as <span>fases</span>
                </h2>
                <p className="section-description">
                    Escolha o plano ideal para sua jornada profissional.
                </p>
            </div>

            <div className="pricing-grid">
                {plans.map((plan, index) => (
                    <div key={index} className={`pricing-card ${plan.highlight ? 'featured' : ''}`}>
                        {plan.badge && <div className="pricing-badge">{plan.badge}</div>}
                        <h3 className="pricing-name">{plan.name}</h3>
                        <p className="pricing-desc" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
                            {plan.description}
                        </p>
                        <div className="pricing-price">
                            {plan.price}
                            <small>{plan.period}</small>
                        </div>

                        <ul className="pricing-features">
                            {plan.features.map((feat, i) => (
                                <li key={i}>
                                    {feat.included ?
                                        <CheckCircle2 size={18} className="text-indigo-500" style={{ color: 'var(--primary-indigo)' }} /> :
                                        <XCircle size={18} style={{ color: '#cbd5e1' }} />
                                    }
                                    <span style={{ color: feat.included ? 'var(--text-body)' : 'var(--text-muted)' }}>
                                        {feat.text}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <button
                            className={`pricing-btn ${plan.highlight ? 'pricing-btn-primary' : 'pricing-btn-outline'}`}
                            onClick={() => navigate('/login')}
                            disabled={plan.cta === "Em Breve"}
                        >
                            {plan.cta}
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
}

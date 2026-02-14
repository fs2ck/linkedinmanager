import React from 'react';

export default function Steps() {
    const steps = [
        {
            title: "Conectar Perfil",
            description: "Integração segura via API oficial do LinkedIn."
        },
        {
            title: "Definir Guia",
            description: "Escolha seu tom de voz e objetivos de carreira."
        },
        {
            title: "Criar com IA",
            description: "Gere sugestões de posts em segundos."
        },
        {
            title: "Publicar & Crescer",
            description: "Acompanhe as métricas e veja seu perfil decolar."
        }
    ];

    return (
        <section className="landing-section steps-section-bg" id="steps">
            <div className="section-header">
                <h2 className="section-title">
                    4 Passos Simples para o <span>Topo</span>
                </h2>
                <p className="section-description">
                    Deixe a complexidade com a gente e foque no que importa: seu networking.
                </p>
            </div>

            <div className="steps-grid">
                {steps.map((step, index) => (
                    <div key={index} className="step-card">
                        <div className="step-number">
                            {index + 1}
                        </div>
                        <h3 className="step-title">{step.title}</h3>
                        <p className="step-text">{step.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

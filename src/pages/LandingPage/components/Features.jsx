import React from 'react';
import {
    Calendar, PenTool, BarChart2, Clock,
    MessageSquare, Zap
} from 'lucide-react';

export default function Features() {
    const features = [
        {
            icon: Calendar,
            title: "Planejamento Estratégico",
            description: "Defina seus pilares de conteúdo e deixe nossa IA organizar seu calendário mensal automaticamente."
        },
        {
            icon: PenTool,
            title: "Editor Inteligente",
            description: "Crie posts virais em segundos com templates baseados nos posts de maior performance da rede."
        },
        {
            icon: BarChart2,
            title: "Analytics Avançado",
            description: "Entenda quem é seu público, quais posts convertem mais e receba insights para sua próxima postagem."
        },
        {
            icon: Clock,
            title: "Publicação Automatizada",
            description: "Agende seus posts nos melhores horários de audiência e nunca mais esqueça de postar."
        },
        {
            icon: Zap,
            title: "IA Adaptativa (Tone)",
            description: "Treine a IA com seus próprios textos para que ela escreva exatamente com a sua voz e personalidade."
        },
        {
            icon: MessageSquare,
            title: "Gestão de Comentários",
            description: "Responda a todos os comentários com sugestões inteligentes e aumente o engajamento do seu post."
        }
    ];

    return (
        <section className="landing-section" id="features">
            <div className="section-header">
                <span className="section-tag">Funcionalidades</span>
                <h2 className="section-title">
                    Tudo que você precisa para<br /><span>dominar o LinkedIn</span>
                </h2>
                <p className="section-description">
                    Nossas ferramentas foram desenhadas para economizar 10+ horas semanais na sua criação de conteúdo.
                </p>
            </div>

            <div className="features-grid">
                {features.map((feature, index) => (
                    <div key={index} className="feature-card">
                        <div className="feature-icon">
                            <feature.icon size={24} />
                        </div>
                        <h3 className="feature-title">{feature.title}</h3>
                        <p className="feature-description">{feature.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

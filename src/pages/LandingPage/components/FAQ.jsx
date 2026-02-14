import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
        {
            question: "Como funciona o período gratuito?",
            answer: "Você pode criar até 5 posts por mês gratuitamente, sem necessidade de cartão de crédito. Ideal para testar a plataforma e ver os resultados antes de investir."
        },
        {
            question: "Posso cancelar a qualquer momento?",
            answer: "Sim! Não há contratos de fidelidade. Você pode cancelar, fazer upgrade ou downgrade do seu plano a qualquer momento, diretamente pelo painel."
        },
        {
            question: "Meus dados estão seguros?",
            answer: "Absolutamente. Utilizamos criptografia de ponta a ponta e seguimos todas as diretrizes da LGPD. Seus dados nunca são compartilhados com terceiros."
        },
        {
            question: "Como a IA aprende o meu tom de voz?",
            answer: "No plano Pro, você pode alimentar a IA com exemplos dos seus textos anteriores. Ela analisa padrões de linguagem, vocabulário e estilo para gerar conteúdo que soa autenticamente como você."
        },
        {
            question: "Preciso integrar minha conta do LinkedIn?",
            answer: "Para funcionalidades básicas como geração de posts, não. Para analytics avançado e publicação automática, sim — a integração é feita de forma segura via API oficial do LinkedIn."
        }
    ];

    const toggle = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="landing-section" id="faq">
            <div className="section-header">
                <h2 className="section-title">
                    Perguntas <span>Frequentes</span>
                </h2>
                <p className="section-description">
                    Tire suas dúvidas sobre a plataforma.
                </p>
            </div>

            <div className="faq-list">
                {faqs.map((faq, index) => (
                    <div
                        key={index}
                        className={`faq-item ${openIndex === index ? 'open' : ''}`}
                        onClick={() => toggle(index)}
                    >
                        <div className="faq-question">
                            <span>{faq.question}</span>
                            <ChevronDown size={20} className="faq-chevron" />
                        </div>
                        <div className="faq-answer">
                            <p>{faq.answer}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

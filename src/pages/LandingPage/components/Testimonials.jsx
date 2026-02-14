import React from 'react';
import { Star } from 'lucide-react';

export default function Testimonials() {
    const testimonials = [
        {
            text: "O ElevateIn mudou minha forma de ver o LinkedIn. Antes eu postava uma vez por mês, agora tenho conteúdo diário de qualidade.",
            name: "Ricardo M.",
            role: "Diretor de Marketing"
        },
        {
            text: "A função de treinar a IA com minha voz é absurda. Meus contatos não percebem que uso IA, soa exatamente como eu.",
            name: "Juliana S.",
            role: "Tech Recruiter"
        },
        {
            text: "Alcancei o selo de Top Voice em 4 meses usando as estratégias da plataforma. O investimento se pagou na primeira semana.",
            name: "André L.",
            role: "Consultor de Vendas"
        }
    ];

    return (
        <section className="landing-section" id="testimonials">
            <div className="section-header">
                <h2 className="section-title">
                    O que dizem <span>nossos usuários</span>
                </h2>
            </div>

            <div className="testimonials-grid">
                {testimonials.map((t, index) => (
                    <div key={index} className="testimonial-card">
                        <div className="testimonial-stars">
                            {[1, 2, 3, 4, 5].map(s => <Star key={s} size={16} fill="currentColor" />)}
                        </div>
                        <p className="testimonial-text">"{t.text}"</p>
                        <div className="testimonial-author">
                            <div className="testimonial-avatar">
                                {t.name.charAt(0)}
                            </div>
                            <div>
                                <div className="testimonial-name">{t.name}</div>
                                <div className="testimonial-role">{t.role}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

import React from 'react';

export default function Stats() {
    const stats = [
        {
            value: "250+",
            label: "Profissionais Ativos"
        },
        {
            value: "1.500+",
            label: "Posts Gerados"
        },
        {
            value: "45%",
            label: "Aumento de Engajamento"
        },
        {
            value: "10+",
            label: "Top Voices Atendidos"
        }
    ];

    return (
        <section className="metrics-section">
            <div className="metrics-inner">
                <div className="metrics-grid">
                    {stats.map((stat, index) => (
                        <div key={index} className="metric-card">
                            <div className="metric-value">{stat.value}</div>
                            <div className="metric-label">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

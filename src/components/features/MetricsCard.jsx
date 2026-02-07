import './MetricsCard.css';

export default function MetricsCard({
    title,
    value,
    change,
    icon: Icon,
    variant = 'default',
    trend
}) {
    const isPositive = change >= 0;

    return (
        <div className={`metrics-card metrics-card-${variant}`}>
            <div className="metrics-card-header">
                <div className="metrics-card-icon">
                    {Icon && <Icon size={24} />}
                </div>
                <span className="metrics-card-title">{title}</span>
            </div>

            <div className="metrics-card-body">
                <div className="metrics-card-value">{value}</div>
                {change !== undefined && (
                    <div className={`metrics-card-change ${isPositive ? 'positive' : 'negative'}`}>
                        <span className="change-icon">{isPositive ? '↑' : '↓'}</span>
                        <span>{Math.abs(change)}% vs mês anterior</span>
                    </div>
                )}
            </div>
        </div>
    );
}

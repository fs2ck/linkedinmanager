import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './PerformanceChart.css';

export function BarChartComponent({ data, dataKey, xKey, title, fullHeight = false }) {
    return (
        <div className={`chart-container ${fullHeight ? 'chart-full-height' : ''}`}>
            {title && <h3 className="chart-title">{title}</h3>}
            <div style={{ flex: fullHeight ? 1 : 'none', minHeight: fullHeight ? 0 : 300 }}>
                <ResponsiveContainer width="100%" height={fullHeight ? '100%' : 300}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                        <XAxis dataKey={xKey} stroke="var(--text-tertiary)" />
                        <YAxis stroke="var(--text-tertiary)" />
                        <Tooltip
                            contentStyle={{
                                background: 'var(--bg-primary)',
                                border: '1px solid var(--border-light)',
                                borderRadius: 'var(--radius-md)',
                            }}
                        />
                        <Bar dataKey={dataKey} fill="var(--color-primary-500)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export function PieChartComponent({ data, title }) {
    const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B'];

    return (
        <div className="chart-container">
            {title && <h3 className="chart-title">{title}</h3>}
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>
            <div className="chart-legend">
                {data.map((entry, index) => (
                    <div key={entry.name} className="legend-item">
                        <span
                            className="legend-color"
                            style={{ background: COLORS[index % COLORS.length] }}
                        />
                        <span className="legend-label">{entry.name}</span>
                        <span className="legend-value">{entry.value}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
